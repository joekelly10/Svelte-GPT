<script>
    import { tick } from 'svelte'

    let input
    let input_text
    let history
    let chat_history = []

    function keydownMessageInput(e) {
        if (e.key == 'Enter' && !e.shiftKey) {
            e.preventDefault()
            return sendMessage()
        }
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
        scrollToBottom()

        const response = await fetch('/api/ai/chat', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ user_message: input_text })
        })

        const data = await response.json()
        const text = data.choices[0].message.content
        
        console.log('📥 GPT response:')
        console.log(text)

        const gpt_message = {
            author: 'GPT',
            content: text
        }
        
        chat_history = [...chat_history, gpt_message]
        await tick()
        scrollToBottom()
    }
    
    const scrollToBottom = async () => {
        history.scroll({ top: history.scrollHeight, behavior: 'smooth' })
    }
</script>

<svelte:head>
    <title>GPT API</title>
</svelte:head>

<main class='chat'>
    <div class='history-mask'>
        <div class='history' bind:this={history}>
            {#each chat_history as message}
            <div class='message {message.author}'>
                <div class='avatar-container'>
                    <strong class='author-name'>{message.author}</strong>
                </div>
                {message.content}
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
        border-radius:    16px
        background-color: lighten($off-black, 3%)
        overflow:         hidden

    .history
        height:        100%
        padding-right: 16px
        overflow-y:    scroll

        &::-webkit-scrollbar
            width:      8px
            background: transparent
        
        &::-webkit-scrollbar-thumb
            background:    $mid-grey
            border-radius: 99px

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
            background-color: darken($off-black, 1.5%)

            .author-name
                background-color: $coral
                color:            darken($off-black, 1.5%)
        
        &.GPT
            .author-name
                background-color: $openai-green
            
            &:last-of-type
                &:after
                    content:          ''
                    position:         absolute
                    bottom:           -1px
                    left:             0
                    width:            100%
                    height:           1px
                    background-color: white(0.1)

    .footer
        flex-grow:        0
        box-sizing:       border-box
        padding:          space.$default-padding 0
        background-color: $off-black

    .input-container
        margin:           0 auto
        width:            $main-column-width
        max-width:        720px
        box-sizing:       border-box
        padding:          16px
        border:           1px solid $mid-grey
        border-radius:    12px
        background-color: lighten($off-black, 3%)
    
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
        resize:        none
        overflow:      overlay

        &::-webkit-scrollbar
            width:      8px
            background: transparent
        
        &::-webkit-scrollbar-thumb
            background:    white
            border-radius: 99px
</style>
