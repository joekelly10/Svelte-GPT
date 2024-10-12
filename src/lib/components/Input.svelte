<script>
    import hljs from 'highlight.js'
    import { onMount, tick, createEventDispatcher } from 'svelte'
    import { addCopyButtons } from '$lib/utils/helpers'
    import { initialising, chat_id, messages, forks, active_fork, active_messages, loader_active, shortcuts_active, prompt_editor_active, config } from '$lib/stores/chat'
    import { model, temperature, top_p, api_status } from '$lib/stores/ai'
    import { page } from '$app/stores'
    import Shortcuts from '$lib/components/Input/Shortcuts.svelte'

    const dispatch = createEventDispatcher()
    
    let input
    let input_text
    let rate_limiter

    export const autofocus = () => input.focus()
    export const regenerateResponse = async () => sendMessage(true)

    export const chatLoaded = async () => {
        autofocus()
        await tick()
        hljs.highlightAll()
        addCopyButtons()
        model.setById($active_messages[$active_messages.length - 1].model.id)
    }

    onMount(async () => {
        await fetchSystemPrompt()
        $initialising = false
        getMessageFromURL()
        autofocus()
    })

    const fetchSystemPrompt = async () => {
        const response = await fetch('/api/system-prompts/active')
        const data = await response.json()
        $messages[0] = {
            id:               0,
            parent_id:        null,
            role:             'system',
            system_prompt_id: data.id,
            content:          data.message
        }
    }

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
            dispatch('sendingMessage')
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
                        if ($model.type === 'open-ai' || $model.type === 'llama') {
                            gpt_message.content += data.choices[0].delta.content ?? ''
                        } else if ($model.type === 'anthropic') {
                            if (data.type === 'content_block_delta') {
                                gpt_message.content += data.delta.text ?? ''
                            } else if (data.type === 'message_start') {
                                gpt_message.usage.input_tokens = data.message.usage.input_tokens
                            } else if (data.type === 'message_delta') {
                                gpt_message.usage.output_tokens = data.usage.output_tokens
                            }
                        } else if ($model.type === 'google') {
                            gpt_message.content += data.candidates[0].content.parts[0].text ?? ''
                            gpt_message.usage.input_tokens = data.usageMetadata.promptTokenCount
                            gpt_message.usage.output_tokens = data.usageMetadata.candidatesTokenCount
                        } else if ($model.type === 'cohere') {
                            if (data.type === 'content-delta') {
                                gpt_message.content += data.delta.message.content.text
                            } else if (data.type === 'message-end') {
                                gpt_message.usage.input_tokens = data.delta.usage.billed_units.input_tokens
                                gpt_message.usage.output_tokens = data.delta.usage.billed_units.output_tokens
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
        
        //  Anthropic + Google model usage is sent in the event stream
        if ($model.type === 'open-ai' || $model.type === 'llama') {
            gpt_message.usage = await getUsage()
        }

        $messages = [...$messages.slice(0,-1), gpt_message]
    }

    const getUsage = async () => {
        const response = await fetch(`/api/ai/usage/${$model.type}`, {
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
        if ($loader_active || $prompt_editor_active) return

        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
            e.preventDefault()
            return openPromptEditor()
        }

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

    const toggleShortcuts = () => $shortcuts_active = !$shortcuts_active
    const openPromptEditor = () => $prompt_editor_active = true

    const newChat = async () => {
        $messages      = $messages.slice(0,1)
        $forks         = [{ message_ids: [0], forked_at: [], provisional: false }]
        $active_fork   = 0
        $chat_id       = null
        $loader_active = false
        $page.url.searchParams.delete('user_message')
        window.history.replaceState(null, '', $page.url.toString())
        autofocus()
        await fetchSystemPrompt()
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
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            class='input'
            contenteditable='true'
            bind:this={input}
            bind:innerText={input_text}
            on:keydown={keydownMessageInput}
            on:paste|preventDefault={pastedInput}
        ></div>
    </div>

    <button class='system-prompt-button' class:active={$prompt_editor_active} on:click={openPromptEditor}>
        {#if $messages.length === 1}
            <svg class='icon edit-icon' viewBox='0 0 106.86 122.88'><g><path d='M46.77,116.58c1.74,0,3.15,1.41,3.15,3.15c0,1.74-1.41,3.15-3.15,3.15H7.33c-2.02,0-3.85-0.82-5.18-2.15 C0.82,119.4,0,117.57,0,115.55V7.33c0-2.02,0.82-3.85,2.15-5.18C3.48,0.82,5.31,0,7.33,0h90.02c2.02,0,3.85,0.83,5.18,2.15 c1.33,1.33,2.15,3.16,2.15,5.18v50.14c0,1.74-1.41,3.15-3.15,3.15c-1.74,0-3.15-1.41-3.15-3.15V7.33c0-0.28-0.12-0.54-0.31-0.72 c-0.19-0.19-0.45-0.31-0.72-0.31H7.33c-0.28,0-0.54,0.12-0.73,0.3C6.42,6.8,6.3,7.05,6.3,7.33v108.21c0,0.28,0.12,0.54,0.31,0.72 c0.19,0.19,0.45,0.31,0.73,0.31H46.77L46.77,116.58z M98.7,74.34c-0.51-0.49-1.1-0.72-1.78-0.71c-0.68,0.01-1.26,0.28-1.74,0.78 l-3.91,4.07l10.97,10.59l3.95-4.11c0.47-0.48,0.67-1.1,0.66-1.78c-0.01-0.67-0.25-1.28-0.73-1.74L98.7,74.34L98.7,74.34z M78.21,114.01c-1.45,0.46-2.89,0.94-4.33,1.41c-1.45,0.48-2.89,0.97-4.33,1.45c-3.41,1.12-5.32,1.74-5.72,1.85 c-0.39,0.12-0.16-1.48,0.7-4.81l2.71-10.45l0,0l20.55-21.38l10.96,10.55L78.21,114.01L78.21,114.01z M31.58,41.08 c-1.74,0-3.15-1.41-3.15-3.15s1.41-3.15,3.15-3.15h41.54c1.74,0,3.15,1.41,3.15,3.15s-1.41,3.15-3.15,3.15H31.58L31.58,41.08z M31.58,85.77c-1.74,0-3.16-1.43-3.16-3.19s1.41-3.19,3.16-3.19h20.47c1.74,0,3.16,1.43,3.16,3.19s-1.41,3.19-3.16,3.19H31.58 L31.58,85.77z M31.58,63.41c-1.74,0-3.15-1.41-3.15-3.15s1.41-3.15,3.15-3.15h41.54c1.74,0,3.15,1.41,3.15,3.15 s-1.41,3.15-3.15,3.15H31.58L31.58,63.41z'/></g></svg>
        {:else}
            <svg class='icon view-icon' viewBox='0 0 122.88 68.18'><defs><style>.cls-1{fill-rule:evenodd}</style></defs><path class='cls-1' d='M61.44,13.81a20.31,20.31,0,1,1-14.34,6,20.24,20.24,0,0,1,14.34-6ZM1.05,31.31A106.72,106.72,0,0,1,11.37,20.43C25.74,7.35,42.08.36,59,0s34.09,5.92,50.35,19.32a121.91,121.91,0,0,1,12.54,12,4,4,0,0,1,.25,5,79.88,79.88,0,0,1-15.38,16.41A69.53,69.53,0,0,1,63.43,68.18,76,76,0,0,1,19.17,53.82,89.35,89.35,0,0,1,.86,36.44a3.94,3.94,0,0,1,.19-5.13Zm15.63-5A99.4,99.4,0,0,0,9.09,34,80.86,80.86,0,0,0,23.71,47.37,68.26,68.26,0,0,0,63.4,60.3a61.69,61.69,0,0,0,38.41-13.72,70.84,70.84,0,0,0,12-12.3,110.45,110.45,0,0,0-9.5-8.86C89.56,13.26,74.08,7.58,59.11,7.89S29.63,14.48,16.68,26.27Zm39.69-7.79a7.87,7.87,0,1,1-7.87,7.87,7.86,7.86,0,0,1,7.87-7.87Z'/></svg>
        {/if}
        System prompt
    </button>
</section>

<style lang='sass'>
    .user-input
        flex-grow:        0
        position:         relative
        width:            100%
        box-sizing:       border-box
        padding:          space.$default-padding 0
        background-color: $background-darker
        user-select:      none
    
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
    
    .system-prompt-button
        display:       flex
        align-items:   center
        position:      absolute
        top:           50%
        right:         space.$default-padding
        transform:     translateY(-50%)
        padding:       15px 20px 15px 16px
        border:        1px solid transparent
        border-radius: 8px
        line-height:   1.6
        font-size:     14px
        color:         $background-lightest
        cursor:        pointer

        &:hover
            color: $blue-grey

            .icon
                fill: $blue-grey
        
        &:active
            border-color: $background-lighter
            color:        $blue-grey

            .icon
                fill: $blue-grey
        
        &.active
            border-color: $blue-grey
            color:        $blue-grey

            .icon
                fill: $blue-grey
        
        .icon
            margin-right: 16px
            height:       21px
            fill:         $background-lightest

            &.view-icon
                height: 13px
</style>
