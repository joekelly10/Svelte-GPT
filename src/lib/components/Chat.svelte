<script>
    import { marked } from 'marked'
    import { createEventDispatcher, tick } from 'svelte'
    import { api_status, messages, forks, active_fork, active_messages, fork_points, token_count, loader_active } from '$lib/stores/chat'
    import { messageCount, insert } from '$lib/utils/helpers'
    import { fade, slide, fly } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'

    marked.use({ mangle: false, headerIds: false })

    const dispatch = createEventDispatcher()
    
    let chat
    
    let deleting          = false
    let forking_from      = null
    let uparrow_limiter   = null
    let downarrow_limiter = null

    export const scrollToBottom = (delay = 0) => {
        //  HACK: account for delay on fork animations
        setTimeout(() => chat.scroll({ top: chat.scrollHeight, behavior: 'smooth' }), delay)
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
        if (e.key === 'Escape') {
            if ($forks[$active_fork].provisional) return cancelProvisionalFork()
        }
    }

    const regenerateResponse = async () => {
        if (confirm(`Regenerate this response?  Press OK to confirm.`)) {
            deleting = true
            const deleted = $forks[$active_fork].message_ids.splice(-1,1)
            $messages = $messages.filter(m => m.id !== deleted.id)
            dispatch('regenerateResponse')
            await tick()
            deleting = false
        }
    }

    const deleteMessage = async (message_id) => {
        if (confirm(`Delete this message?  Press OK to confirm.`)) {
            deleting = true
            $forks[$active_fork].message_ids.splice(-2,2)
            $messages = $messages.filter(m => m.id !== message_id && m.id !== message_id - 1)
            handleForksAfterDelete()
            dispatch('chatModified')
            await tick()
            deleting = false
        }
    }

    const forkFrom = (message_id) => {
        forking_from = $active_fork
        insert(message_id, $forks[$active_fork].forked_at)
        const forked_at   = $forks[$active_fork].forked_at.filter(id => id <= message_id)
        const message_ids = $forks[$active_fork].message_ids.filter(id => id <= message_id)
        $forks       = $forks.concat([{ message_ids, forked_at, provisional: true }])
        $active_fork = $forks.length - 1
        dispatch('chatModified')
    }

    const hasForks   = (message_id) => forkPoints(message_id).length > 0
    const forkPoints = (message_id) => $fork_points.filter(pair => pair[0] === message_id)

    const getForksAt = (message_id) => {
        let all_forks = []
        forkPoints(message_id).forEach(fp => {
            const index         = firstIndexOf(fp)
            const active_ids    = $forks[$active_fork].message_ids
            const message_index = active_ids.indexOf(message_id)
            const is_active     = fp[1] === active_ids[message_index + 1]
            const provisional   = $forks[index].provisional
            all_forks.push({ index, is_active, provisional })
        })
        return all_forks
    }

    const firstIndexOf = (fork_point) => {
        const index = $forks.findIndex(fork => {
            const index = fork.message_ids.findIndex(id => id === fork_point[0])
            return fork.message_ids[index + 1] === fork_point[1]
        })
        return index
    }

    const switchToFork = (fork_index) => {
        $active_fork = fork_index
        if (forking_from !== null) {
            forking_from = null
            removeProvisionalFork()
        }
        dispatch('chatModified')
    }

    const removeProvisionalFork = () => {
        for (let i = 0; i < $forks.length; i++) {
            if ($forks[i].provisional) {
                const forked_at = $forks[i].forked_at[$forks[i].forked_at.length - 1]

                //  Remove the fork point from the other fork if there's only
                //  one other fork left after removing the provisional one

                let other_forks = []
                for (let _i = 0; _i < $forks.length; _i++) {
                    if (i === _i) continue
                    if ($forks[_i].forked_at.includes(forked_at)) other_forks.push(_i)
                }
                if (other_forks.length === 1) {
                    const index = other_forks[0]
                    $forks[index].forked_at = $forks[index].forked_at.filter(id => id !== forked_at)
                }

                $forks.splice(i,1)

                //  if the provisional fork was not at the end of the array when
                //  removed, which can happen when deleting messages on an
                //  old fork, `active_fork` may go out of range:

                if ($active_fork > $forks.length - 1) $active_fork -= 1
            }
        }
        $forks = $forks
    }

    const handleForksAfterDelete = () => {
        for (let i = 0; i < $forks.length; i++) {
            const fork            = $forks[i]
            const last_forked_at  = fork.forked_at[fork.forked_at.length - 1]
            const last_message_id = fork.message_ids[fork.message_ids.length - 1]

            //  Make the fork provisional again if we've deleted messages back
            //  to a fork point (it's effectively a new empty fork)

            if (last_forked_at === last_message_id) {
                for (let _i = 0; _i < $forks.length; _i++) {
                    if (_i === i) continue
                    if ($forks[_i].forked_at.includes(last_forked_at)) {
                        forking_from = _i
                        $forks[i].provisional = true
                    }
                }
            }
        }
        $forks = $forks
    }

    const cancelProvisionalFork = () => switchToFork(forking_from)

    const scaleDelay = () => forking_from ? 100 : 0
    const scaleDuration = () => deleting || forking_from ? 300 : 0
</script>

<svelte:document on:keydown={keydown} />

<section class='chat' class:loader-active={$loader_active} bind:this={chat}>
    <div class='stats'>
        {messageCount($active_messages)} {messageCount($active_messages) === 1 ? 'message' : 'messages'}<br>
        {$token_count} tokens
    </div>

    <div class='messages'>
        {#each $active_messages as message, i}
            {#if message.role !== 'system'}
                <div class='message {message.role} {message.model ?? ''}' class:streaming={i === $messages.length - 1 && message.role === 'assistant' && $api_status === 'streaming'} out:slide={{ delay: scaleDelay(), duration: scaleDuration(), easing: quartOut }}>
                    {#if message.role === 'assistant' && $api_status !== 'streaming' && !$forks[$active_fork].provisional}
                        <div class='message-controls' out:fade={{ duration: 250, easing: quartOut }} in:slide={{ axis: 'x', duration: 250, easing: quartOut }}>
                            {#if i === $active_messages.length - 1}
                                <button class='message-control-button retry' title='Regenerate response' on:click={() => regenerateResponse()}>
                                    <svg class='icon' xmlns='http://www.w3.org/2000/svg' enable-background='new 0 0 24 24' viewBox='0 0 24 24' id='retry'><path d='M21,11c-0.6,0-1,0.4-1,1c0,2.9-1.5,5.5-4,6.9c-3.8,2.2-8.7,0.9-10.9-2.9C2.9,12.2,4.2,7.3,8,5.1c3.3-1.9,7.3-1.2,9.8,1.4 h-2.4c-0.6,0-1,0.4-1,1s0.4,1,1,1h4.5c0.6,0,1-0.4,1-1V3c0-0.6-0.4-1-1-1s-1,0.4-1,1v1.8C17,3,14.6,2,12,2C6.5,2,2,6.5,2,12 s4.5,10,10,10c5.5,0,10-4.5,10-10C22,11.4,21.6,11,21,11z'></path></svg>
                                </button>
                                <button class='message-control-button delete' title='Delete message' on:click={() => deleteMessage(message.id)}>
                                    <svg class='icon' xmlns='http://www.w3.org/2000/svg' enable-background='new 0 0 24 24' viewBox='0 0 24 24' id='close'><path d='M13.4,12l6.3-6.3c0.4-0.4,0.4-1,0-1.4c-0.4-0.4-1-0.4-1.4,0L12,10.6L5.7,4.3c-0.4-0.4-1-0.4-1.4,0c-0.4,0.4-0.4,1,0,1.4 l6.3,6.3l-6.3,6.3C4.1,18.5,4,18.7,4,19c0,0.6,0.4,1,1,1c0.3,0,0.5-0.1,0.7-0.3l6.3-6.3l6.3,6.3c0.2,0.2,0.4,0.3,0.7,0.3 s0.5-0.1,0.7-0.3c0.4-0.4,0.4-1,0-1.4L13.4,12z'></path></svg>
                                </button>
                            {:else}
                                <button class='message-control-button fork' title='Fork' on:click={() => forkFrom(message.id)}>
                                    <svg class='icon' xmlns='http://www.w3.org/2000/svg' enable-background='new 0 0 24 24' viewBox='0 0 24 24' id='add'><path fill='none' d='M0 0h24v24H0V0z'></path><path d='M18 13h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1z'></path></svg>
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

                {#if message.role === 'assistant' && hasForks(message.id)}
                    <div class='forks' in:slide={{ duration: 150, easing: quartOut }} out:slide={{ duration: 150, easing: quartOut }}>
                        {#each getForksAt(message.id) as fork, i}
                            {#if fork.provisional}
                                <button class='switch-fork-button provisional active'>
                                    <svg class='icon' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 30' x='0px' y='0px'><g><path d='M19.5,4h-4a.5.5,0,0,0,0,1h2.793L14.14648,9.14648a.5.5,0,1,0,.707.707L19,5.707V8.5a.5.5,0,0,0,1,0v-4A.49971.49971,0,0,0,19.5,4Z'/><path d='M5.707,5H8.5a.5.5,0,0,0,0-1h-4a.49971.49971,0,0,0-.5.5v4a.5.5,0,0,0,1,0V5.707l6.5,6.5V19.5a.5.5,0,0,0,1,0V12a.49965.49965,0,0,0-.14648-.35352Z'/></g></svg>
                                    {i + 1}
                                </button>
                                <div class='cancel-fork' in:fly={{ x: -120, delay: 100, duration: 150, easing: quartOut }}>
                                    <button class='cancel-fork-button' title='Cancel Fork (esc)' on:click={cancelProvisionalFork}>
                                        <svg class='icon' xmlns='http://www.w3.org/2000/svg' enable-background='new 0 0 24 24' viewBox='0 0 24 24' id='close'><path d='M13.4,12l6.3-6.3c0.4-0.4,0.4-1,0-1.4c-0.4-0.4-1-0.4-1.4,0L12,10.6L5.7,4.3c-0.4-0.4-1-0.4-1.4,0c-0.4,0.4-0.4,1,0,1.4 l6.3,6.3l-6.3,6.3C4.1,18.5,4,18.7,4,19c0,0.6,0.4,1,1,1c0.3,0,0.5-0.1,0.7-0.3l6.3-6.3l6.3,6.3c0.2,0.2,0.4,0.3,0.7,0.3 s0.5-0.1,0.7-0.3c0.4-0.4,0.4-1,0-1.4L13.4,12z'></path></svg>
                                        Cancel Fork
                                    </button>
                                </div>
                            {:else}
                                <button class='switch-fork-button' class:active={fork.is_active} on:click={() => switchToFork(fork.index)}>
                                    <svg class='icon' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 30' x='0px' y='0px'><g><path d='M19.5,4h-4a.5.5,0,0,0,0,1h2.793L14.14648,9.14648a.5.5,0,1,0,.707.707L19,5.707V8.5a.5.5,0,0,0,1,0v-4A.49971.49971,0,0,0,19.5,4Z'/><path d='M5.707,5H8.5a.5.5,0,0,0,0-1h-4a.49971.49971,0,0,0-.5.5v4a.5.5,0,0,0,1,0V5.707l6.5,6.5V19.5a.5.5,0,0,0,1,0V12a.49965.49965,0,0,0-.14648-.35352Z'/></g></svg>
                                    {i + 1}
                                </button>
                            {/if}
                        {/each}
                    </div>
                {/if}
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
        padding-bottom: 72px
    
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
                height: 22px

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
    
    .forks
        display:         flex
        justify-content: center
        align-items:     center
        position:        relative
        margin-bottom:   space.$default-padding

    .cancel-fork
        position:    absolute
        top:         50%
        left:        100%
        transform:   translateY(-50%)
        margin-left: space.$default-padding
    
    .cancel-fork-button
        display:         flex
        justify-content: center
        align-items:     center
        padding:         15px 20px 15px 16px
        border-radius:   8px
        border:          1px solid $background-lighter
        color:           $background-lightest
        white-space:     nowrap
        cursor:          pointer

        .icon
            margin-right: 16px
            height:       19px
            fill:         $background-lightest
        
        &:hover
            color: $blue-grey

            .icon
                fill: $coral
    
    .switch-fork-button
        display:         flex
        justify-content: center
        align-items:     center
        padding:         0 space.$default-padding
        border-top:      1px solid $background-lighter
        border-bottom:   1px solid $background-lighter
        font-size:       14px
        color:           $background-lightest
        cursor:          pointer

        &:first-of-type
            border-top-left-radius:    8px
            border-bottom-left-radius: 8px
            border-left:               1px solid $background-lighter
        
        &:last-of-type
            border-top-right-radius:    8px
            border-bottom-right-radius: 8px
            border-right:               1px solid $background-lighter

        .icon
            margin-right: 8px
            height:       25px
            transform:    rotate(180deg) translateY(3px) scaleX(-1)
            fill:         $background-lightest

        &:hover
            color: $blue-grey

            .icon
                fill: $blue-grey
        
        &:active
            color: darken($blue-grey, 3%)

            .icon
                fill: darken($blue-grey, 3%)

        &.active
            border-color:     $blue
            background-color: $blue
            color:            $background-darker

            .icon
                fill: $background-darker
    
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
