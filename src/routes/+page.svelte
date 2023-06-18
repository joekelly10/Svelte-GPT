<script>
    import hljs from 'highlight.js'
    import { tick } from 'svelte'
    import { marked } from 'marked'
    import { isStreamedChatCompletion } from '$lib/openai'
    import { test_data } from '$lib/test_data'

    let input
    let input_text
    let history
    let rate_limiter
    let chat_history = test_data
    //
    //  Options below are only set (as instructed) to
    //  suppress upcoming deprecation warnings
    //
    marked.use({
        mangle:    false,
        headerIds: false
    })

    function keydownMessageInput(e) {
        if (e.key == 'Enter' && !e.shiftKey) {
            e.preventDefault()
            return sendMessage()
        }

        if (e.key == 'h') {
            hljs.highlightAll() // temp
        }
    }
    //
    //  Strip pasted text of styling, html etc.
    //
    function pastedInput(e) {
        const plain_text = e.clipboardData.getData('text/plain')
        document.execCommand('insertText', false, plain_text)
        input.scroll({ top: input.scrollHeight })
    }

    async function sendMessage() {
        console.log('📤 Sending message...')

        const user_message = {
            author: 'You',
            content: input_text
        }
        
        input.innerText = ''

        chat_history = [...chat_history, user_message]
        await tick()
        autoScroll()

        const response = await fetch('/api/ai/chat', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ user_message: input_text })
        })

        console.log('📥-⏳ GPT is replying...')

        let gpt_message = {
            author: 'GPT',
            content: ''
        }

        chat_history = [...chat_history, gpt_message]
        await tick()
        autoScroll()

        const decoder = new TextDecoderStream()
        const reader  = response.body.pipeThrough(decoder).getReader()

        while (true) {
            const { value, done } = await reader.read()

            if (done) break
            if (!value) continue

            const [, ...json_strings] = value.split('data: ')
            //
            //  The first chunk in the stream often contains multiple 'data: {}' messages
            //  (presumably due to request latency).
            //
            json_strings.forEach(json_string => {
                if (json_string.trim() == '[DONE]') return
                const json = JSON.parse(json_string)
                if (isStreamedChatCompletion(json)) {
                    gpt_message.content += json.choices[0].delta.content
                }
            })

            chat_history = [...chat_history.slice(0,-1), gpt_message]
            //
            //  Auto-scroll max once every 500ms
            //
            if (!rate_limiter) {
                await tick()
                autoScroll()
                rate_limiter = setTimeout(() => { rate_limiter = null }, 500)
            }
        }
        
        console.log('📥-✅ GPT replied:')
        console.log(gpt_message.content)
        
        await tick()
        autoScroll()
        hljs.highlightAll()
    }
    
    const autoScroll = async () => { 
        history.scroll({ top: history.scrollHeight, behavior: 'smooth' })
    }
</script>

<svelte:head>
    <title>GPT API</title>
    <link rel='stylesheet' href='https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/styles/github-dark.min.css'>
</svelte:head>

<main class='chat'>
    <div class='history-mask'>
        <div class='history' bind:this={history}>
            {#each chat_history as message}
                <div class='message {message.author}'>
                    <div class='avatar-container'>
                        <strong class='author-name'>{message.author}</strong>
                    </div>
                    {@html marked(message.content)}
                </div>
            {/each}
        </div>
    </div>
    <div class='footer'>
        <div class='input-container'>
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
    </div>
</main>


<style lang='sass'>
    +shared.globals

    $sidebar-width:          320px
    $main-column-width:      calc(100vw - 2 * $sidebar-width)
    $avatar-container-width: 90px

    .chat
        display:     flex
        flex-flow:   column nowrap
        margin:      0 auto
        width:       $main-column-width
        max-width:   900px
        height:      100vh
        box-sizing:  border-box
        padding-top: space.$default-padding

    .history-mask
        flex-grow:        1
        padding:          space.$default-padding
        padding-right:    space.$default-padding - 8px
        padding-left:     space.$default-padding + 16px
        border-radius:    16px
        background-color: $lighter-black
        overflow:         hidden

    .history
        height:        100%
        padding-right: 16px
        overflow-y:    scroll
        overflow-x:    hidden

        &::-webkit-scrollbar
            width:            8px
            height:           8px
            background-color: transparent
        
        &::-webkit-scrollbar-thumb
            background-color: white(0.1)
            border-radius:    99px

            &:hover
                background-color: white(0.2)
            
            &:active
                background-color: white(0.25)
        
        &::-webkit-scrollbar-corner
            display: none

    .message
        position:      relative
        margin-bottom: 8px
        padding:       space.$default-padding
        padding-left:  $avatar-container-width
        border-radius: 8px
        line-height:   27px

        .avatar-container
            position:   absolute
            top:        0
            left:       0
            width:      $avatar-container-width
            box-sizing: border-box
            padding:    space.$default-padding
            text-align: center

        .author-name
            display:        inline-block
            vertical-align: top
            padding:        0 5px
            border-radius:  5px
            font-size:      14px
            line-height:    27px

        &.You
            background-color: $darker-black
            .author-name
                background-color: $coral
                color:            $darker-black        
        &.GPT
            .author-name
                background-color: $openai-green
            
            &:last-of-type
                margin-bottom:  0
                padding-bottom: 2 * space.$default-padding

                &:after
                    content:          ''
                    position:         absolute
                    bottom:           -1px
                    left:             0
                    width:            100%
                    height:           1px
                    background-color: white(0.1)
    
    :global
        .message
            pre
                margin:      2em 0
                text-wrap:   wrap
                font-size:   14px
                line-height: 2
            
            code.hljs
                padding:          1.1em 1.5em
                border-radius:    8px
                border:           1px solid black(0.1)
                background-color: $darker-black
    .footer
        flex-grow:        0
        box-sizing:       border-box
        padding:          space.$default-padding 0
        background-color: $darker-black

    .input-container
        margin:           0 auto
        width:            $main-column-width
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
        caret-color:   $coral
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
