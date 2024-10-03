<script>
    import hljs from 'highlight.js'
    import { onMount, tick, createEventDispatcher } from 'svelte'
    import { addCopyButtons } from '$lib/utils/helpers'
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
        config
    } from '$lib/stores/chat'
    import { page } from '$app/stores'
    import Shortcuts from '$lib/components/Input/Shortcuts.svelte'

    const dispatch = createEventDispatcher()
    
    let input
    let input_text
    let rate_limiter

    export const autofocus  = () => input.focus()
    export const regenerateResponse = async () => sendMessage(true)

    export const chatLoaded = async () => {
        autofocus()
        await tick()
        hljs.highlightAll()
        addCopyButtons()
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
        console.log('🤖 Sending message...')

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
            model:       $model.id,
            temperature: $temperature,
            top_p:       $top_p
        }

        const response = await fetch(`/api/ai/chat/${$model.type}`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ messages: $active_messages, options })
        })

        console.log(`🤖-⏳ ${$model.short_name} is replying...`)

        let gpt_message = {
            id:          getNextId(),
            parent_id:   getParentId(),
            role:        'assistant',
            content:     '',
            timestamp:   '',
            model:       $model,
            temperature: $temperature,
            top_p:       $top_p,
            usage:       {
                input_tokens:  0,
                output_tokens: 0
            }
        }

        $api_status = 'streaming'
        $messages   = [...$messages, gpt_message]
        $forks[$active_fork].message_ids.push(gpt_message.id)

        await tick()
        dispatch('scrollChatToBottom')

        const decoder = new TextDecoderStream()
        const reader  = response.body.pipeThrough(decoder).getReader()
        await streamGPTResponse(reader, gpt_message)

        console.log(`🤖-✅ ${$model.short_name} replied: `, gpt_message.content)

        $api_status = 'idle'
        hljs.highlightAll()
        addCopyButtons()

        await tick()
        dispatch('scrollChatToBottom')

        if ($config.autosave) dispatch('save')
    }

    const streamGPTResponse = async (reader, gpt_message) => {
        let buffer      = '',
            brace_count = 0

        while (true) {
            const { value, done } = await reader.read()

            if (done) break
            buffer += value

            let start_index = buffer.indexOf('{')

            //  find JSON objects by counting curly braces;
            //  use quotes to distinguish structural braces
            //  from braces found inside strings

            while (start_index !== -1) {
                brace_count = 1

                let end_index = start_index + 1
                let in_string = false

                while (brace_count > 0 && end_index < buffer.length) {
                    if (buffer[end_index] === '"') {
                        if (buffer[end_index - 1] === '\\') {
                            let backslash_count = 0, i = end_index - 1
                            while (i >= 0 && buffer[i] === '\\') { backslash_count++; i-- }
                            if (backslash_count % 2 === 0) in_string = !in_string
                            //  ^^ handle edge case where string is an escaped
                            //  backslash, breaking the closing quote heuristic
                            //  e.g. { "delta": { "content": "\\" } }
                        } else {
                            in_string = !in_string
                        }
                    }
                    if (!in_string) {
                        if (buffer[end_index] === '{') brace_count++
                        if (buffer[end_index] === '}') brace_count--
                    }
                    end_index++
                }

                if (brace_count === 0) {
                    const json_string = buffer.slice(start_index, end_index)
                    try {
                        const data = JSON.parse(json_string)
                        if ($model.type === 'open-ai') {
                            gpt_message.content += data.choices[0].delta.content ?? ''
                        } else if ($model.type === 'anthropic') {
                            if (data.type === 'content_block_delta') {
                                gpt_message.content += data.delta.text ?? ''
                            } else if (data.type === 'message_start') {
                                gpt_message.usage.input_tokens = data.message.usage.input_tokens
                            } else if (data.type === 'message_delta') {
                                gpt_message.usage.output_tokens = data.usage.output_tokens
                            }
                        }
                    } catch {
                        console.log('❌ Error parsing json: ', json_string)
                    }
                    buffer = buffer.slice(end_index + 1)
                    start_index = buffer.indexOf('{')
                } else {
                    //  incomplete JSON object - need to wait for more data
                    break
                }
            }

            $messages = [...$messages.slice(0,-1), gpt_message]

            //  Auto-scroll max once every 500ms
            if (!rate_limiter) {
                await tick()
                dispatch('scrollChatToBottom')
                rate_limiter = setTimeout(() => { rate_limiter = null }, 500)
            }
        }

        gpt_message.timestamp = new Date().toISOString()
        
        //  Anthropic model usage is sent in the event stream
        if ($model.type === 'open-ai') {
            gpt_message.usage = await getUsage()
        }

        $messages = [...$messages.slice(0,-1), gpt_message]
    }

    const getUsage = async () => {
        const response = await fetch('/api/ai/usage/open-ai', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ messages: $active_messages })
        })

        return await response.json()
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
