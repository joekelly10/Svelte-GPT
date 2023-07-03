<script>
    import hljs from 'highlight.js'
    import { onMount, tick, createEventDispatcher } from 'svelte'
    import { isStreamedChatCompletion } from '$lib/openai'
    import { api_status, messages } from '$lib/stores/chat'
    import { page } from '$app/stores'

    const dispatch = createEventDispatcher()
    
    let input
    let input_text
    let rate_limiter

    onMount(async () => {
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
            
            if ($page.url.searchParams.get('send_immediately')) sendMessage()
        }
    })

    const sendMessage = async () => {
        console.log('📤 Sending message...')
        
        const user_message = { role: 'user', content: input_text }

        input_text  = ''
        $api_status = 'sending'
        $messages   = [...$messages, user_message]

        await tick()
        dispatch('scrollChatToBottom')

        const options = {
            model:       'gpt-3.5-turbo-0613',
            temperature: 0.9,
            top_p:       1
        }

        const response = await fetch('/api/ai/chat', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ messages: $messages, options })
        })

        console.log('📥-⏳ GPT is replying...')

        let gpt_message = { role: 'assistant', content: '' }

        $api_status = 'streaming'
        $messages   = [...$messages, gpt_message]

        await tick()
        dispatch('scrollChatToBottom')

        const decoder = new TextDecoderStream()
        const reader  = response.body.pipeThrough(decoder).getReader()

        while (true) {
            const { value, done } = await reader.read()

            if (done) break
            if (!value) continue

            const [, ...json_strings] = value.split('data: ')

            //  The first chunk in the stream often contains multiple 'data: {}' messages
            //  (presumably due to request latency).

            json_strings.forEach(json_string => {
                if (json_string.trim() == '[DONE]') return
                const json = JSON.parse(json_string)
                if (isStreamedChatCompletion(json)) {
                    gpt_message.content += json.choices[0].delta.content
                }
            })

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
        
        await tick()
        dispatch('scrollChatToBottom')
        hljs.highlightAll()
    }

    const keydownMessageInput = (e) => {
        if (e.key == 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if ($api_status === 'idle' && input_text.trim().length) sendMessage()
        }
    }

    const pastedInput = (e) => {
        document.execCommand('insertText', false, e.clipboardData.getData('text/plain'))
        input.scroll({ top: input.scrollHeight })
    }
</script>

<section class='user-input'>
    <div class='container'>
        <div
            class='input'
            contenteditable='true'
            bind:this={input}
            bind:innerText={input_text}
            on:keydown={keydownMessageInput}
            on:paste|preventDefault={pastedInput}
            autofocus
        ></div>
    </div>
</section>

<style lang='sass'>
    .user-input
        flex-grow:        0
        width:            100%
        box-sizing:       border-box
        padding:          space.$default-padding 0
        background-color: $darker-black
    
    .container
        margin:           0 auto
        width:            space.$main-column-width
        max-width:        720px
        box-sizing:       border-box
        padding:          16px
        border:           1px solid $mid-grey
        border-radius:    12px
        background-color: $lighter-black
    
    .input
        position:      relative
        z-index:       1
        margin:        0 auto
        width:         100%
        max-height:    192px
        box-sizing:    border-box
        padding-right: 16px
        line-height:   24px
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
