<script>
    import { marked } from 'marked'
    import { api_status, messages, token_count, loader_active } from '$lib/stores/chat'

    marked.use({ mangle: false, headerIds: false })
    
    let chat
    let uparrow_limiter
    let downarrow_limiter

    export const scrollToBottom = () => {
        chat.scroll({ top: chat.scrollHeight, behavior: 'smooth' })
    }

    const keydown = (e) => {
        if ($loader_active) return

        if (e.shiftKey && e.altKey && e.key == 'ArrowUp') {
            return chat.scroll({ top: 0, behavior: 'smooth' })
        }
        if (e.shiftKey && e.altKey && e.key == 'ArrowDown') {
            return chat.scroll({ top: chat.scrollHeight, behavior: 'smooth' })
        }
        if (e.altKey && e.key == 'ArrowUp') {
            if (uparrow_limiter) return
            uparrow_limiter = setTimeout(() => { uparrow_limiter = null }, 200)
            return chat.scrollBy({ top: -400, behavior: 'smooth' })
        }
        if (e.altKey && e.key == 'ArrowDown') {
            if (downarrow_limiter) return
            downarrow_limiter = setTimeout(() => { downarrow_limiter = null }, 200)
            return chat.scrollBy({ top: 400, behavior: 'smooth' })
        }
    }
</script>

<svelte:document on:keydown={keydown} />

<section class='chat' class:loader-active={$loader_active} bind:this={chat}>
    <div class='stats'>
        {$messages.length - 1} messages<br>
        {$token_count} tokens
    </div>

    <div class='messages'>
        {#each $messages as message, i}
            {#if message.role !== 'system'}
                <div class='message {message.role} {message.model ?? ''}' class:streaming={i === $messages.length - 1 && message.role === 'assistant' && $api_status === 'streaming'}>
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
        +shared.scrollbar

        &.loader-active
            overflow: hidden
    
    .stats
        position:      fixed
        top:           space.$header-height
        right:         16px
        padding:       space.$default-padding
        border-radius: 8px
        line-height:   1.6
        text-align:    right
        font-weight:   500
        font-size:     14px
        color:         lighten($lighter-black, 5%)
        
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
        +shared.code_block_styles

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
            
            &.gpt-4
                .author-name
                    background-color: $gpt4-purple
        
        &.streaming
            padding-bottom: 1.25 * space.$default-padding
            animation:      streaming 1.5s linear infinite
    
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
