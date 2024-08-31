<script>
    import hljs from 'highlight.js'
    import { onMount, tick, createEventDispatcher } from 'svelte'
    import { isStreamedChatCompletion, addCopyButtons } from '$lib/utils/helpers'
    import { 
        model,
        temperature,
        top_p,
        api_status,
        chat_id,
        messages,
        forks,
        active_fork,
        active_messages,
        token_count,
        loader_active,
        shortcuts_active,
        config,
        expand_context_window
    } from '$lib/stores/chat'
    import { page } from '$app/stores'
    import Shortcuts from '$lib/components/Shortcuts.svelte'

    const dispatch = createEventDispatcher()
    
    let input
    let input_text
    let rate_limiter

    export const autofocus  = () => input.focus()
    export const regenerateResponse = async () => sendMessage(true)

    export const chatLoaded = async () => {
        autofocus()
        countTokens()
        await tick()
        hljs.highlightAll()
    }

    onMount(() => {
        getMessageFromURL()
        autofocus()
    })

    const getNextId = () => $messages[$messages.length - 1].id + 1

    const getParentId = () => {
        const message_ids = $forks[$active_fork].message_ids
        return message_ids[message_ids.length - 1]
    }

    const sendMessage = async (is_regeneration = false) => {
        console.log('📤 Sending message...')

        if (!is_regeneration) {
            const user_message = {
                id:        getNextId(),
                parent_id: getParentId(),
                role:      'user',
                content:   input_text
            }
            input_text = ''
            $messages  = [...$messages, user_message]
            $forks[$active_fork].message_ids.push(user_message.id)
            $forks[$active_fork].provisional = false
            $forks = $forks
        }

        $api_status = 'sending'

        await tick()
        hljs.highlightAll()
        dispatch('scrollChatToBottom')

        const options = {
            model:       $expand_context_window ? $model.expanded.id : $model.id,
            temperature: $temperature,
            top_p:       $top_p
        }

        // drop the `model` property else OpenAI gives a 400
        const mapped = $active_messages.map(({ role, content }) => ({ role, content }))

        const response = await fetch('/api/ai/chat', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ messages: mapped, options })
        })

        console.log('📥-⏳ GPT is replying...')

        let gpt_message = {
            id:        getNextId(),
            parent_id: getParentId(),
            role:      'assistant',
            content:   '',
            model:     $model.id
        }

        $api_status = 'streaming'
        $messages   = [...$messages, gpt_message]
        $forks[$active_fork].message_ids.push(gpt_message.id)

        await tick()
        dispatch('scrollChatToBottom')

        const decoder = new TextDecoderStream()
        const reader  = response.body.pipeThrough(decoder).getReader()

        // JSON objects can get split across stream chunks
        // so use a buffer to combine the split parts:
        let buffer = ''

        function parse_all(json_strings) {
            json_strings.forEach(json_string => {
                if (json_string.trim() === '[DONE]') return
                try {
                    const json = JSON.parse(json_string)
                    if (isStreamedChatCompletion(json)) {
                        gpt_message.content += json.choices[0].delta.content
                    }
                } catch {
                    console.log('Error parsing json: ', json_string)
                    console.log('⏳ Buffering until next chunk...')
                    buffer = json_string
                }
            })
        }

        while (true) {
            const { value, done } = await reader.read()

            if (done) break
            if (!value) continue

            if (value.indexOf('data: ') === 0) {
                const json_strings = value.split('data: ')
                parse_all(json_strings.slice(1))
            } else {
                // JSON object has got split across stream chunks:
                const json_strings = value.split('data: ')

                buffer += json_strings[0]
                console.log('⌛️ ...buffered:', buffer)

                try {
                    const json = JSON.parse(buffer)
                    if (isStreamedChatCompletion(json)) {
                        gpt_message.content += json.choices[0].delta.content
                    }
                } catch {
                    console.log('❌ Error parsing json from buffer - adding \'[ ]\'.')
                    gpt_message.content += ' [ ]' // to indicate a dropped token
                }

                buffer = ''

                parse_all(json_strings.slice(1))
            }

            $messages = [...$messages.slice(0,-1), gpt_message]

            //  Auto-scroll max once every 500ms
            if (!rate_limiter) {
                await tick()
                dispatch('scrollChatToBottom')
                rate_limiter = setTimeout(() => { rate_limiter = null }, 500)
            }
        }
        
        console.log('📥-✅ GPT replied:')
        console.log(gpt_message.content)
        
        $api_status = 'idle'
        
        hljs.highlightAll()
        addCopyButtons()
        
        await tick()
        
        dispatch('scrollChatToBottom')
        countTokens()

        if ($config.autosave) dispatch('save')
    }

    const countTokens = async () => {
        const response = await fetch('/api/tokens', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ messages: $active_messages })
        })

        const json = await response.json()

        $token_count = json.token_count
    }

    const getMessageFromURL = async () => {
        if ($messages.length === 1 && $page.url.searchParams.has('user_message')) {
            input_text = $page.url.searchParams.get('user_message')

            await tick()

            let range = document.createRange()
            range.selectNodeContents(input)
            range.collapse(false)

            let selection = window.getSelection()
            selection.removeAllRanges()
            selection.addRange(range)

            await tick()
            
            if ($page.url.searchParams.get('send_immediately')) {
                sendMessage()
                removeSendImmediatelyFromURL()
            }
        }
    }

    const removeSendImmediatelyFromURL = () => {
        $page.url.searchParams.delete('send_immediately')
        window.history.replaceState(null, '', $page.url.toString())
    }

    const pastedInput = (e) => {
        document.execCommand('insertText', false, e.clipboardData.getData('text/plain'))
        input.scroll({ top: input.scrollHeight })
    }

    const deleteChat = async () => {
        if (confirm('Delete current chat?  Press OK to confirm.')) {
            console.log(`🗑️ Deleting chat: ${$chat_id}...`)
            const response = await fetch(`/api/chats/${$chat_id}`, {
                method:  'DELETE',
                headers: { 'Content-Type': 'application/json' }
            })

            if (response.ok) {
                console.log(`🗑️–✅ Chat deleted.`)
                newChat()
            } else {
                console.log(`🗑️–❌ Delete failed: ${response.status} ${response.statusText}`)
                const json = await response.json()
                if (json) console.log(json)
            }
        }
    }

    const keydownMessageInput = (e) => {
        if ($loader_active) {
            e.preventDefault()
            return
        }
        if (e.key == 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if ($api_status === 'idle' && input_text.trim().length) sendMessage()
        }
    }

    const keydownDocument = (e) => {
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault()
            return newChat()
        }
        if (e.metaKey && e.altKey && e.key === 'Backspace') {
            e.preventDefault()
            if ($chat_id && !$loader_active) return deleteChat()
        }
        if (e.metaKey && e.key === '/') {
            e.preventDefault()
            return toggleShortcuts()
        }
        if (e.metaKey && e.shiftKey && e.key === '?') {
            e.preventDefault()
            return toggleShortcuts()
        }
    }

    const toggleShortcuts = () => {
        $shortcuts_active = !$shortcuts_active
    }

    const newChat = () => {
        $messages      = $messages.slice(0,1)
        $forks         = [{ message_ids: [0], forked_at: [], provisional: false }]
        $active_fork   = 0
        $token_count   = 0
        $chat_id       = null
        $loader_active = false
        $page.url.searchParams.delete('user_message')
        window.history.replaceState(null, '', $page.url.toString())
        autofocus()
    }
</script>

<svelte:document on:keydown={keydownDocument} />

<section class='user-input'>
    <button class='shortcuts-button' class:active={$shortcuts_active} on:click={toggleShortcuts}>
        Keyboard shortcuts<br>
        <strong class='shortcut'>⌘ /</strong>
    </button>

    {#if $shortcuts_active}
        <Shortcuts/>
    {/if}

    <div class='container'>
        <div
            class='input'
            contenteditable='true'
            bind:this={input}
            bind:innerText={input_text}
            on:keydown={keydownMessageInput}
            on:paste|preventDefault={pastedInput}
        ></div>
    </div>
</section>

<style lang='sass'>
    .user-input
        flex-grow:        0
        position:         relative
        width:            100%
        box-sizing:       border-box
        padding:          space.$default-padding 0
        background-color: $background-darker
    
    .shortcuts-button
        position:      absolute
        top:           50%
        left:          16px
        transform:     translateY(-50%)
        padding:       space.$default-padding
        border-radius: 8px
        line-height:   1.6
        text-align:    left
        font-size:     14px
        color:         $background-lightest
        cursor:        pointer

        &:hover
            color: $blue-grey
        
        &.active
            color: $off-white

            .shortcut
                color: $blue
            
            &:hover
                opacity: 0.95
    
    .container
        margin:           0 auto
        width:            space.$main-column-width
        max-width:        720px
        box-sizing:       border-box
        padding:          16px
        border:           1px solid $blue-grey
        border-radius:    12px
        background-color: $background-lighter
    
    .input
        position:      relative
        z-index:       1
        margin:        0 auto
        width:         100%
        max-height:    192px
        box-sizing:    border-box
        padding-right: 16px
        line-height:   1.6
        text-align:    left
        font-family:   font.$sans-serif
        font-size:     16px
        font-weight:   400
        color:         white
        caret-color:   $blue
        text-wrap:     wrap
        resize:        none
        overflow:      overlay

        &::-webkit-scrollbar
            width:      8px
            height:     8px
            background: transparent
        
        &::-webkit-scrollbar-thumb
            background:    white
            border-radius: 99px
</style>
