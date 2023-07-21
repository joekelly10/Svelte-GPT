<script>
    import { marked } from 'marked'
    import { createEventDispatcher, tick } from 'svelte'
    import { api_status, chat_id, messages, token_count, loader_active } from '$lib/stores/chat'
    import { messageCount } from '$lib/utils/helpers'
    import { fade, slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'

    marked.use({ mangle: false, headerIds: false })

    const dispatch = createEventDispatcher()
    
    let chat
    let uparrow_limiter
    let downarrow_limiter
    let deleting

    export const scrollToBottom = () => {
        chat.scroll({ top: chat.scrollHeight, behavior: 'smooth' })
    }

    const keydown = (e) => {
        if ($loader_active) return

        if (e.shiftKey && e.altKey && e.key === 'ArrowUp') {
            return chat.scroll({ top: 0, behavior: 'smooth' })
        }
        if (e.shiftKey && e.altKey && e.key === 'ArrowDown') {
            return chat.scroll({ top: chat.scrollHeight, behavior: 'smooth' })
        }
        if (e.altKey && e.key === 'ArrowUp') {
            if (uparrow_limiter) return
            uparrow_limiter = setTimeout(() => { uparrow_limiter = null }, 200)
            return chat.scrollBy({ top: -480, behavior: 'smooth' })
        }
        if (e.altKey && e.key === 'ArrowDown') {
            if (downarrow_limiter) return
            downarrow_limiter = setTimeout(() => { downarrow_limiter = null }, 200)
            return chat.scrollBy({ top: 480, behavior: 'smooth' })
        }
        if (e.ctrlKey && e.key === 'Backspace') {
            return deleteMessage($messages.length-1)
        }
        if (e.ctrlKey && e.key === 'r') {
            return regenerateResponse()
        }
    }

    const regenerateResponse = async () => {
        if (confirm(`Regenerate the last response?  Press OK to confirm.`)) {
            deleting = true
            $messages = $messages.slice(0,-1)
            dispatch('regenerateResponse')
            await tick()
            deleting = false
        }
    }

    const deleteMessage = async (index) => {
        if (confirm(`Delete this message?  Press OK to confirm.`)) {
            deleting = true
            $messages = $messages.slice(0, index-1).concat($messages.slice(index+1))
            dispatch('chatModified')
            await tick()
            deleting = false
        }
    }

    const forkFrom = (index) => {
        if (confirm('Fork a new chat from here?')) {
            $messages[index].forked = $chat_id
            $chat_id  = null
            $messages = $messages.slice(0, index+1)
            dispatch('chatModified')
        }
    }

    const scaleDuration = () => deleting ? 250 : 0
</script>

<svelte:document on:keydown={keydown} />

<section class='chat' class:loader-active={$loader_active} bind:this={chat}>
    <div class='stats'>
        {messageCount($messages)} {messageCount($messages) === 1 ? 'message' : 'messages'}<br>
        {$token_count} tokens
    </div>

    <div class='messages'>
        {#each $messages as message, i}
            {#if message.role !== 'system'}
                <div class='message {message.role} {message.model ?? ''}' class:streaming={i === $messages.length - 1 && message.role === 'assistant' && $api_status === 'streaming'} class:forked={message.forked} data-index={i} out:slide={{ duration: scaleDuration(), easing: quartOut }}>
                    {#if message.role === 'assistant' && $api_status !== 'streaming'}
                        <div class='message-controls' out:fade={{ duration: 250, easing: quartOut }} in:slide={{ axis: 'x', duration: 250, easing: quartOut }}>
                            {#if i === $messages.length - 1}
                                <button class='message-control-button retry' title='Regenerate response' on:click={() => regenerateResponse()}>
                                    <svg class='icon' xmlns='http://www.w3.org/2000/svg' enable-background='new 0 0 24 24' viewBox='0 0 24 24' id='retry'><path d='M21,11c-0.6,0-1,0.4-1,1c0,2.9-1.5,5.5-4,6.9c-3.8,2.2-8.7,0.9-10.9-2.9C2.9,12.2,4.2,7.3,8,5.1c3.3-1.9,7.3-1.2,9.8,1.4 h-2.4c-0.6,0-1,0.4-1,1s0.4,1,1,1h4.5c0.6,0,1-0.4,1-1V3c0-0.6-0.4-1-1-1s-1,0.4-1,1v1.8C17,3,14.6,2,12,2C6.5,2,2,6.5,2,12 s4.5,10,10,10c5.5,0,10-4.5,10-10C22,11.4,21.6,11,21,11z'></path></svg>
                                </button>
                                <button class='message-control-button delete' title='Delete message' on:click={() => deleteMessage(i)}>
                                    <svg class='icon' xmlns='http://www.w3.org/2000/svg' enable-background='new 0 0 24 24' viewBox='0 0 24 24' id='close'><path d='M13.4,12l6.3-6.3c0.4-0.4,0.4-1,0-1.4c-0.4-0.4-1-0.4-1.4,0L12,10.6L5.7,4.3c-0.4-0.4-1-0.4-1.4,0c-0.4,0.4-0.4,1,0,1.4 l6.3,6.3l-6.3,6.3C4.1,18.5,4,18.7,4,19c0,0.6,0.4,1,1,1c0.3,0,0.5-0.1,0.7-0.3l6.3-6.3l6.3,6.3c0.2,0.2,0.4,0.3,0.7,0.3 s0.5-0.1,0.7-0.3c0.4-0.4,0.4-1,0-1.4L13.4,12z'></path></svg>
                                </button>
                            {:else}
                                <button class='message-control-button fork' title='Fork' on:click={() => forkFrom(i)}>
                                    <svg class='icon' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 30' x='0px' y='0px'><g><path d='M19.5,4h-4a.5.5,0,0,0,0,1h2.793L14.14648,9.14648a.5.5,0,1,0,.707.707L19,5.707V8.5a.5.5,0,0,0,1,0v-4A.49971.49971,0,0,0,19.5,4Z'/><path d='M5.707,5H8.5a.5.5,0,0,0,0-1h-4a.49971.49971,0,0,0-.5.5v4a.5.5,0,0,0,1,0V5.707l6.5,6.5V19.5a.5.5,0,0,0,1,0V12a.49965.49965,0,0,0-.14648-.35352Z'/></g></svg>
                                </button>
                            {/if}
                        </div>
                    {/if}
                                    
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
        font-size:     14px
        color:         $background-lightest
        
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
        transition:    padding-bottom easing.$quart-out 0.25s, border-bottom easing.$quart-out 0.25s
        +shared.code_block_styles

        &:first-of-type
            margin-top: space.$default-padding

        .avatar-container
            display:         flex
            align-items:     center
            justify-content: center
            position:        absolute
            top:             0
            left:            0
            width:           space.$avatar-container-width
            padding:         space.$default-padding 0
            text-align:      center

        .author-name
            position:       relative
            top:            2px
            padding:        0 5px
            border-radius:  5px
            line-height:    24px
            font-size:      14px
            font-weight:    600

        &.user
            border-radius:    8px 8px 0 0
            background-color: $background-lighter

            .author-name
                background-color: $blue
                color:            $background-darker
   
        &.assistant
            margin-bottom:    space.$default-padding
            border-radius:    0 0 8px 8px
            background-color: $background-lighter

            .author-name
                background-color: $openai-green
            
            &.gpt-4
                .author-name
                    background-color: $gpt4-purple
        
        &.streaming
            padding-bottom: 1.25 * space.$default-padding
            animation:      streaming 1.5s linear infinite

    .message-controls
        position:    absolute
        bottom:      0
        left:        100%
        margin-left: space.$default-padding
        width:       48px
    
    .message-control-button
        display:         flex
        align-items:     center
        justify-content: center
        margin-bottom:   16px
        width:           40px
        height:          40px
        box-sizing:      border-box
        border-radius:   8px
        border:          1px solid $background-lighter
        transition:      background-color easing.$quart-out 0.25s, border-color easing.$quart-out 0.25s
        cursor:          pointer

        &:last-of-type
            margin-bottom: 0
        
        .icon
            fill:       $background-lightest
            transition: fill easing.$quart-out 0.25s
        
        &.fork
            .icon
                height:    27px
                transform: rotate(180deg) translateY(3.25px)

            &:hover
                border-color:     $lilac
                background-color: $lilac
                transition:       none
                
                .icon
                    fill:       $background-darker
                    transition: none

            &:active
                border-color:     darken($lilac, 3%)
                background-color: darken($lilac, 3%)
                transition:       none
                
                .icon
                    fill:       $background-darker
                    transition: none
    
        &.retry
            .icon
                height: 18px

            &:hover
                border-color:     $blue
                background-color: $blue
                transition:       none
                
                .icon
                    fill:       $background-darker
                    transition: none

            &:active
                border-color:     darken($blue, 3%)
                background-color: darken($blue, 3%)
                transition:       none
                
                .icon
                    fill:       $background-darker
                    transition: none
            
        &.delete
            .icon
                height: 19px

            &:hover
                border-color:     $coral
                background-color: $coral
                transition:       none
                
                .icon
                    fill:       $background-darker
                    transition: none

            &:active
                border-color:     darken($coral, 3%)
                background-color: darken($coral, 3%)
                transition:       none
                
                .icon
                    fill:       $background-darker
                    transition: none
    
    @keyframes streaming
        0%
            border-bottom: 8px solid $background-lighter
        67%
            border-bottom: 8px solid white(0.5)
        75%
            border-bottom: 8px solid white(0.5)
        100%
            border-bottom: 8px solid $background-lighter
</style>
