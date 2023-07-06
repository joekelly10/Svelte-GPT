<script>
    import { marked } from 'marked'
    import { api_status, messages } from '$lib/stores/chat'

    marked.use({ mangle: false, headerIds: false })
    
    let chat

    export const scrollToBottom = () => {
        chat.scroll({ top: chat.scrollHeight, behavior: 'smooth' })
    }
</script>

<section class='chat' bind:this={chat}>
    <div class='messages'>
        {#each $messages as message, i}
            {#if message.role !== 'system'}
                <div class='message {message.role}' class:streaming={i === $messages.length - 1 && message.role === 'assistant' && $api_status === 'streaming'}>
                    <div class='avatar-container'>
                        <strong class='author-name'>
                            {message.role === 'user' ? 'You' : 'GPT'}
                        </strong>
                    </div>
                    {@html marked(message.content)}
                </div>
            {/if}
        {/each}
    </div>
</section>

<style lang='sass'>
    .chat
        flex-grow:  1
        overflow-y: overlay
    
        &::-webkit-scrollbar
            width:            8px
            height:           8px
            background-color: transparent
        
        &::-webkit-scrollbar-thumb
            background-color: white(0.125)
            border-radius:    99px

            &:hover
                background-color: white(0.2)
            
            &:active
                background-color: white(0.25)
        
        &::-webkit-scrollbar-corner
            display: none
        
    .messages
        margin:         0 auto
        width:          space.$main-column-width
        padding-bottom: 32px
    
    .message
        position:      relative
        margin:        1px 0
        padding:       space.$default-padding
        padding-left:  space.$avatar-container-width
        border-bottom: 0px solid transparent
        line-height:   30px
        transition:    padding-bottom easing.$quart-out 0.25s, border-bottom easing.$quart-out 0.25s

        &:first-of-type
            margin-top: space.$default-padding

        .avatar-container
            position:   absolute
            top:        0
            left:       0
            width:      space.$avatar-container-width
            box-sizing: border-box
            padding:    space.$default-padding
            text-align: center

        .author-name
            display:        inline-block
            vertical-align: top
            padding:        0 5px
            border-radius:  5px
            line-height:    24px
            font-size:      14px
            font-weight:    600

        &.user
            border-radius:    8px 8px 0 0
            background-color: $lighter-black

            .author-name
                background-color: $blue
                color:            $darker-black
   
        &.assistant
            margin-bottom:    space.$default-padding
            border-radius:    0 0 8px 8px
            background-color: $lighter-black

            .author-name
                background-color: $openai-green
        
        &.streaming
            padding-bottom: 1.25 * space.$default-padding
            animation:      streaming 1.5s linear infinite
    
    :global
        .message
            pre
                position:    relative
                margin:      32px 0
                text-wrap:   wrap
                font-size:   14px
                line-height: 2
            
                code.hljs
                    margin:           0
                    padding:          18px 24px
                    border-radius:    8px
                    border:           1px solid black(0.1)
                    background-color: $darker-black
                
                .copy-code
                    position:    absolute
                    bottom:      0
                    right:       0
                    font-family: font.$sans-serif
                
                .copy-code-button
                    display:          inline-block
                    padding:          12px 24px
                    border-radius:    8px 0 8px 0
                    border:           1px solid $darker-black
                    background-color: $lighter-black
                    font-weight:      500
                    cursor:           pointer

                    &:hover
                        background-color: darken($lighter-black, 1%)
                    
                    &:active
                        background-color: darken($lighter-black, 2%)
            
            code
                margin:           0 1px
                padding:          3px 6px
                border-radius:    5px
                background-color: $darker-black
                font-size:        14px
                color:            $pale-blue
    
    @keyframes streaming
        0%
            border-bottom: 8px solid $lighter-black
        67%
            border-bottom: 8px solid white(0.5)
        75%
            border-bottom: 8px solid white(0.5)
        100%
            border-bottom: 8px solid $lighter-black
</style>
