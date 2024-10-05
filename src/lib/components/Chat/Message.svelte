<script>
    import { marked } from 'marked'
    import { createEventDispatcher } from 'svelte'
    import { active_messages } from '$lib/stores/chat'
    import { api_status } from '$lib/stores/ai'
    import { fade, slide, fly } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import MessageInfo from '$lib/components/Chat/MessageInfo.svelte'

    marked.use({ breaks: true, mangle: false, headerIds: false })

    const dispatch = createEventDispatcher()

    export let message,
               index,
               forks,
               deleting,
               provisionally_forking
    
    let is_last
    $: is_last = index === $active_messages.length - 1

    let show_info = false

    const outDuration = () => deleting ? 300 : 0
</script>

<div class='message {message.role} {message.model?.id ?? ''}' class:streaming={is_last && message.role === 'assistant' && $api_status === 'streaming'} out:slide={{ duration: outDuration(), easing: quartOut }}>
    {#if message.role === 'assistant' && $api_status !== 'streaming' && !provisionally_forking}
        <div class='message-controls' in:slide={{ axis: 'x', duration: 250, easing: quartOut }} out:fade={{ duration: 250, easing: quartOut }}>
            {#if is_last}
                <button class='message-control-button retry' title='Regenerate response' on:click={() => dispatch('regenerateResponse')}>
                    <svg class='icon' xmlns='http://www.w3.org/2000/svg' enable-background='new 0 0 24 24' viewBox='0 0 24 24' id='retry'><path d='M21,11c-0.6,0-1,0.4-1,1c0,2.9-1.5,5.5-4,6.9c-3.8,2.2-8.7,0.9-10.9-2.9C2.9,12.2,4.2,7.3,8,5.1c3.3-1.9,7.3-1.2,9.8,1.4 h-2.4c-0.6,0-1,0.4-1,1s0.4,1,1,1h4.5c0.6,0,1-0.4,1-1V3c0-0.6-0.4-1-1-1s-1,0.4-1,1v1.8C17,3,14.6,2,12,2C6.5,2,2,6.5,2,12 s4.5,10,10,10c5.5,0,10-4.5,10-10C22,11.4,21.6,11,21,11z'></path></svg>
                </button>
                <button class='message-control-button delete' title='Delete message' on:click={() => dispatch('deleteMessage')}>
                    <svg class='icon' xmlns='http://www.w3.org/2000/svg' enable-background='new 0 0 24 24' viewBox='0 0 24 24' id='close'><path d='M13.4,12l6.3-6.3c0.4-0.4,0.4-1,0-1.4c-0.4-0.4-1-0.4-1.4,0L12,10.6L5.7,4.3c-0.4-0.4-1-0.4-1.4,0c-0.4,0.4-0.4,1,0,1.4 l6.3,6.3l-6.3,6.3C4.1,18.5,4,18.7,4,19c0,0.6,0.4,1,1,1c0.3,0,0.5-0.1,0.7-0.3l6.3-6.3l6.3,6.3c0.2,0.2,0.4,0.3,0.7,0.3 s0.5-0.1,0.7-0.3c0.4-0.4,0.4-1,0-1.4L13.4,12z'></path></svg>
                </button>
            {:else}
                <button class='message-control-button fork' title='Fork' on:click={() => dispatch('forkFrom', { message_id: message.id })}>
                    <svg class='icon' xmlns='http://www.w3.org/2000/svg' enable-background='new 0 0 24 24' viewBox='0 0 24 24' id='add'><path fill='none' d='M0 0h24v24H0V0z'></path><path d='M18 13h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1z'></path></svg>
                </button>
            {/if}
        </div>
    {/if}
                    
    <div class='avatar-container'>
        {#if message.role === 'user'}
            <img class='avatar user' src='/img/avatar.png' alt='You'>
        {:else}
            <img class='avatar gpt' src='/img/icons/models/{message.model.icon}' alt='{message.model.name}' on:mouseenter={() => { show_info = true }} on:mouseleave={() => { show_info = false }}>
        {/if}
    </div>

    {#if show_info}
        <MessageInfo message={message} />
    {/if}

    {@html marked(message.content)}
</div>

<div class='forks-container'>
    {#if message.role === 'assistant' && forks.length > 0}
        <div class='forks' in:slide={{ duration: 100, easing: quartOut }}>
            {#each forks as fork, i}
                {#if fork.provisional}
                    <button class='switch-fork-button provisional active'>
                        <svg class='icon' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 30' x='0px' y='0px'><g><path d='M19.5,4h-4a.5.5,0,0,0,0,1h2.793L14.14648,9.14648a.5.5,0,1,0,.707.707L19,5.707V8.5a.5.5,0,0,0,1,0v-4A.49971.49971,0,0,0,19.5,4Z'/><path d='M5.707,5H8.5a.5.5,0,0,0,0-1h-4a.49971.49971,0,0,0-.5.5v4a.5.5,0,0,0,1,0V5.707l6.5,6.5V19.5a.5.5,0,0,0,1,0V12a.49965.49965,0,0,0-.14648-.35352Z'/></g></svg>
                        {i + 1}
                    </button>
                {:else}
                    <button class='switch-fork-button' class:active={fork.is_active} on:click={() => { dispatch('switchToFork', { fork_index: fork.index })}}>
                        <svg class='icon' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 30' x='0px' y='0px'><g><path d='M19.5,4h-4a.5.5,0,0,0,0,1h2.793L14.14648,9.14648a.5.5,0,1,0,.707.707L19,5.707V8.5a.5.5,0,0,0,1,0v-4A.49971.49971,0,0,0,19.5,4Z'/><path d='M5.707,5H8.5a.5.5,0,0,0,0-1h-4a.49971.49971,0,0,0-.5.5v4a.5.5,0,0,0,1,0V5.707l6.5,6.5V19.5a.5.5,0,0,0,1,0V12a.49965.49965,0,0,0-.14648-.35352Z'/></g></svg>
                        {i + 1}
                    </button>
                {/if}
            {/each}
        </div>
    {/if}
    <div class='cancel-fork'>
        {#if provisionally_forking && is_last}
            <button class='cancel-fork-button' title='Cancel Fork (esc)' on:click={() => dispatch('cancelProvisionalFork')} in:fly={{ x: -90, delay: 50, duration: 200, easing: quartOut }}>
                <svg class='icon' xmlns='http://www.w3.org/2000/svg' enable-background='new 0 0 24 24' viewBox='0 0 24 24' id='close'><path d='M13.4,12l6.3-6.3c0.4-0.4,0.4-1,0-1.4c-0.4-0.4-1-0.4-1.4,0L12,10.6L5.7,4.3c-0.4-0.4-1-0.4-1.4,0c-0.4,0.4-0.4,1,0,1.4 l6.3,6.3l-6.3,6.3C4.1,18.5,4,18.7,4,19c0,0.6,0.4,1,1,1c0.3,0,0.5-0.1,0.7-0.3l6.3-6.3l6.3,6.3c0.2,0.2,0.4,0.3,0.7,0.3 s0.5-0.1,0.7-0.3c0.4-0.4,0.4-1,0-1.4L13.4,12z'></path></svg>
                Cancel Fork
            </button>
        {/if}
    </div>
</div>

<style lang='sass'>
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
            height:          space.$avatar-container-width
            text-align:      center

            .avatar
                height:     32px
                transition: transform easing.$quart-out 0.125s

                &.user
                    border-radius: 8px
                
                &.gpt
                    cursor: pointer

                    &:hover
                        transform:  scale(1.1)
                        transition: none

        &.user
            border-radius:    8px 8px 0 0
            background-color: $background-lighter

        &.assistant
            margin-bottom:    space.$default-padding
            border-radius:    0 0 8px 8px
            background-color: $background-lighter
        
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
        transition:      background-color easing.$quart-out 0.1s, border-color easing.$quart-out 0.1s
        cursor:          pointer

        &:last-of-type
            margin-bottom: 0
        
        .icon
            fill:       $background-lightest
            transition: fill easing.$quart-out 0.1s
        
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
    
    .forks-container
        position: relative
    
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
            border-color:     $coral
            background-color: $coral
            color:            $background-darker

            .icon
                fill: $background-darker
    
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
