<script>
    import { marked } from 'marked'
    import { createEventDispatcher, tick } from 'svelte'
    import { messages, deleting, provisionally_forking } from '$lib/stores/chat'
    import { api_status } from '$lib/stores/ai'
    import { fade, slide, fly } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import MessageInfo from '$lib/components/Chat/MessageInfo.svelte'

    marked.use({ breaks: true, mangle: false, headerIds: false })

    const dispatch = createEventDispatcher()

    export let message

    let show_info = false

    $: parent_index = $messages.findIndex(m => m.id === message.parent_id)

    const hoveredDelete = async () => {
        if (message.has_siblings) {
            $messages[parent_index].delete_fork_highlight = true
        } else {
            $messages[parent_index].delete_highlight = true
        }
        await tick()
        message.delete_highlight = true
    }

    const unhoveredDelete = async () => {
        if (parent_index === -1) return
        $messages[parent_index].delete_highlight      = false
        $messages[parent_index].delete_fork_highlight = false
        await tick()
        message.delete_highlight = false
    }

    const hoveredRegenerate = async () => {
        $messages[parent_index].regenerate_highlight = true
        await tick()
        message.regenerate_highlight = true
    }

    const unhoveredRegenerate = async () => {
        if (parent_index === -1) return
        $messages[parent_index].regenerate_highlight = false
        await tick()
        message.regenerate_highlight = false
    }

    const hoveredAddReply = async () => {
        $messages[parent_index].add_reply_highlight = true
        await tick()
        message.add_reply_highlight = true
    }
    
    const unhoveredAddReply = async () => {
        $messages[parent_index].add_reply_highlight = false
        await tick()
        message.add_reply_highlight = false
    }

    const clickedDelete     = () => dispatch(message.has_siblings ? 'deleteOne' : 'deleteBoth')
    const clickedRegenerate = () => dispatch('regenerateReply')
    const clickedAddReply   = () => dispatch('addReply', { message_id: message.parent_id })
</script>

<div
    id='message-{message.id}'
    class='message {message.role}'
    class:streaming={message.is_last && message.role === 'assistant' && $api_status === 'streaming'}
    class:delete-highlight={message.delete_highlight}
    class:regenerate-highlight={message.regenerate_highlight}
    class:add-reply-highlight={message.add_reply_highlight && !message.has_siblings}
    out:slide={{ duration: $deleting ? 250 : 0, easing: quartOut }}
    in:slide={{ delay: $deleting ? 500 : 0, duration: $deleting ? 250 : 0, easing: quartOut }}
>
    {#if message.role === 'assistant' && $api_status !== 'streaming' && !$provisionally_forking}
        <div class='message-controls' in:slide={{ axis: 'x', duration: 250, easing: quartOut }} out:fade={{ duration: 250, easing: quartOut }}>
            {#if message.is_last}
                <button class='message-control-button add' title='Add another reply' on:click={clickedAddReply} on:mouseenter={hoveredAddReply} on:mouseleave={unhoveredAddReply}>
                    <svg class='icon' viewBox='0 0 7 7'><path d='m.5.5 6 6m0-6-6 6' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round'/></svg>
                </button>
                <button class='message-control-button retry' title='Regenerate reply' on:click={clickedRegenerate} on:mouseenter={hoveredRegenerate} on:mouseleave={unhoveredRegenerate}>
                    <svg class='icon' enable-background='new 0 0 24 24' viewBox='0 0 24 24' id='retry'><path d='M21,11c-0.6,0-1,0.4-1,1c0,2.9-1.5,5.5-4,6.9c-3.8,2.2-8.7,0.9-10.9-2.9C2.9,12.2,4.2,7.3,8,5.1c3.3-1.9,7.3-1.2,9.8,1.4 h-2.4c-0.6,0-1,0.4-1,1s0.4,1,1,1h4.5c0.6,0,1-0.4,1-1V3c0-0.6-0.4-1-1-1s-1,0.4-1,1v1.8C17,3,14.6,2,12,2C6.5,2,2,6.5,2,12 s4.5,10,10,10c5.5,0,10-4.5,10-10C22,11.4,21.6,11,21,11z'></path></svg>
                </button>
                <button class='message-control-button delete' title='Delete message' on:click={clickedDelete} on:mouseenter={hoveredDelete} on:mouseleave={unhoveredDelete}>
                    <svg class='icon' viewBox='0 0 7 7'><path d='m.5.5 6 6m0-6-6 6' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round'/></svg>
                </button>
            {:else}
                <button class='message-control-button fork' title='Fork' on:click={() => dispatch('forkFrom', { message_id: message.id })}>
                    <svg class='icon' viewBox='22 30 53 40'><path d='M74.191 50.855a2.3 2.3 0 0 0 .168-.855c0-.301-.063-.59-.168-.856l-.012-.035a2.3 2.3 0 0 0-.508-.766l-17.676-17.68a2.343 2.343 0 0 0-3.312 3.313l13.676 13.68H24.671a2.345 2.345 0 0 0 0 4.688h41.688L52.683 66.018a2.343 2.343 0 0 0 3.312 3.313l17.676-17.676q.331-.33.508-.766c.008-.011.008-.023.012-.035z'/></svg>
                </button>
            {/if}
        </div>
    {:else if $provisionally_forking && message.is_last}
        <div class='provisional-fork-controls' in:fly={{ x: -32, delay: 100, duration: 250, easing: quartOut }}>
            <button class='provisional-fork-button add-reply' title='Add another reply' on:click={clickedAddReply} on:mouseenter={hoveredAddReply} on:mouseleave={unhoveredAddReply}>
                <div class='icon-container'>
                    <svg class='icon' viewBox='0 0 7 7'><path d='m.5.5 6 6m0-6-6 6' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round'/></svg>
                </div>
                Add Reply
            </button>
            <button class='provisional-fork-button cancel-fork' title='Cancel Fork (esc)' on:click={() => dispatch('cancelProvisionalFork')}>
                <div class='icon-container'>
                    <svg class='icon' enable-background='new 0 0 24 24' viewBox='0 0 24 24' id='close'><path d='M13.4,12l6.3-6.3c0.4-0.4,0.4-1,0-1.4c-0.4-0.4-1-0.4-1.4,0L12,10.6L5.7,4.3c-0.4-0.4-1-0.4-1.4,0c-0.4,0.4-0.4,1,0,1.4 l6.3,6.3l-6.3,6.3C4.1,18.5,4,18.7,4,19c0,0.6,0.4,1,1,1c0.3,0,0.5-0.1,0.7-0.3l6.3-6.3l6.3,6.3c0.2,0.2,0.4,0.3,0.7,0.3 s0.5-0.1,0.7-0.3c0.4-0.4,0.4-1,0-1.4L13.4,12z'></path></svg>
                </div>
                Cancel Fork
            </button>
        </div>
    {/if}

    {#if show_info}
        <MessageInfo message={message} />
    {/if}

    <div class='avatar-container'>
        {#if message.role === 'user'}
            <img class='avatar user' src='/img/avatar.png' alt='You'>
        {:else}
            <img class='avatar gpt' src='/img/icons/models/{message.model.icon}' alt='{message.model.name}' on:mouseenter={() => { show_info = true }} on:mouseleave={() => { show_info = false }}>
        {/if}
    </div>

    {@html marked(message.content)}
</div>

{#if message.role === 'user' && message.forks.length > 1}
    <div class='sibling-forks-container' class:delete-fork-highlight={message.delete_fork_highlight} in:slide={{ duration: 250, easing: quartOut }} out:slide={{ duration: 250, easing: quartOut }}>
        {#each message.forks as fork, i}
            <button class='sibling-fork-button' class:active={fork.is_active} on:click={() => dispatch('switchToFork', { fork_index: fork.index })}>
                <svg class='icon' viewBox='4 4 16 16' transform='scale(1 -1)'><path d='M19.5 4h-4a.5.5 0 0 0 0 1h2.793l-4.147 4.146a.5.5 0 1 0 .707.707L19 5.707V8.5a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-.5-.5M5.707 5H8.5a.5.5 0 0 0 0-1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 1 0V5.707l6.5 6.5V19.5a.5.5 0 0 0 1 0V12a.5.5 0 0 0-.146-.354Z'/></svg>
                {i + 1}
            </button>
        {/each}
        {#if message.add_reply_highlight}
            <button class='sibling-fork-button temporary' in:slide={{ axis: 'x', duration: 125, easing: quartOut }} out:slide={{ axis: 'x', duration: 125, easing: quartOut }}>
                <svg class='icon' viewBox='4 4 16 16' transform='scale(1 -1)'><path d='M19.5 4h-4a.5.5 0 0 0 0 1h2.793l-4.147 4.146a.5.5 0 1 0 .707.707L19 5.707V8.5a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-.5-.5M5.707 5H8.5a.5.5 0 0 0 0-1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 1 0V5.707l6.5 6.5V19.5a.5.5 0 0 0 1 0V12a.5.5 0 0 0-.146-.354Z'/></svg>
                <span class='plus'>+</span>
            </button>
        {/if}
    </div>
{/if}

{#if message.role === 'assistant' && message.forks.length > 0}
    <div class='straight-forks-container' in:fly={{ y: -20, delay: 100, duration: 250, easing: quartOut }}>
        {#each message.forks as fork, i}
            {#if fork.provisional}
                <button class='straight-fork-button provisional active'>
                    <svg class='icon' viewBox='4 4 16 16' transform='scale(1 -1)'><path d='M19.5 4h-4a.5.5 0 0 0 0 1h2.793l-4.147 4.146a.5.5 0 1 0 .707.707L19 5.707V8.5a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-.5-.5M5.707 5H8.5a.5.5 0 0 0 0-1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 1 0V5.707l6.5 6.5V19.5a.5.5 0 0 0 1 0V12a.5.5 0 0 0-.146-.354Z'/></svg>
                    {i + 1}
                </button>
            {:else}
                <button class='straight-fork-button' class:active={fork.is_active} on:click={() => { dispatch('switchToFork', { fork_index: fork.index })}}>
                    <svg class='icon' viewBox='4 4 16 16' transform='scale(1 -1)'><path d='M19.5 4h-4a.5.5 0 0 0 0 1h2.793l-4.147 4.146a.5.5 0 1 0 .707.707L19 5.707V8.5a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-.5-.5M5.707 5H8.5a.5.5 0 0 0 0-1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 1 0V5.707l6.5 6.5V19.5a.5.5 0 0 0 1 0V12a.5.5 0 0 0-.146-.354Z'/></svg>
                    {i + 1}
                </button>
            {/if}
        {/each}
    </div>
{/if}

<style lang='sass'>
    .message
        position:     relative
        margin:       1px 0
        padding:      space.$default-padding
        padding-left: space.$avatar-container-width
        border:       0px solid transparent
        transition:   padding-bottom easing.$quart-out 0.25s, border-bottom easing.$quart-out 0.25s, border-top easing.$quart-out 0.125s, background-color easing.$quart-out 0.125s
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

            &.delete-highlight
                background-color: color.adjust($delete-highlight-bg, $alpha: -0.4)
                transition:       none
                text-decoration:  line-through
            
            &.add-reply-highlight
                box-shadow:       0 0 0 2px $blue
                border-radius:    8px 8px 1px 1px
                background-color: $regenerate-highlight-bg
                transition:       none
                z-index:          999

        &.assistant
            margin-bottom:    space.$default-padding
            border-radius:    0 0 8px 8px
            background-color: $background-lighter

            &.delete-highlight
                box-shadow:       0 0 0 2px $coral
                border-radius:    1px 1px 8px 8px
                background-color: $delete-highlight-bg
                transition:       none
                text-decoration:  line-through
            
            &.regenerate-highlight
                box-shadow:       0 0 0 2px $blue
                border-radius:    1px 1px 8px 8px
                background-color: $regenerate-highlight-bg
                transition:       none
                text-decoration:  line-through
        
        &.streaming
            padding-bottom: 1.25 * space.$default-padding
            animation:      streaming 1.5s linear infinite

    .sibling-forks-container
        display:          flex
        justify-content:  center
        padding:          24px 0
        background-color: color.adjust($blue, $alpha: -0.805)
        transition:       background-color easing.$quart-out 0.125s

        &.delete-fork-highlight
            background-color: color.mix($coral, $background-lighter, 10%)
            transition:       none

            .sibling-fork-button
                &.active
                    background-color: $coral
                    border-color:     $coral

        .sibling-fork-button
            display:          flex
            justify-content:  center
            align-items:      center
            padding:          6px 0
            width:            space.$load-save-button-width
            border-top:       1px solid $background
            border-bottom:    1px solid $background
            background-color: $background
            font-size:        14px
            font-weight:      450
            color:            $background-lightest
            cursor:           pointer
            transition:       border-radius easing.$quart-out 0.25s

            &:first-of-type
                border-left:               1px solid $background
                border-top-left-radius:    8px
                border-bottom-left-radius: 8px
            
            &:last-of-type
                border-right:               1px solid $background
                border-top-right-radius:    8px
                border-bottom-right-radius: 8px

            .icon
                margin-right: 11px
                margin-left:  -1px
                height:       15px
                fill:         $background-lightest

            &:hover
                background-color: $background-darker
                color:            $off-white

                .icon
                    fill: $off-white

            &:active
                background-color: color.adjust($background-darker, $lightness: -1%)

            &.active
                font-weight:      450
                color:            $background-darkest
                border-color:     $blue
                background-color: $blue

                .icon
                    fill: $background-darkest
            
            &.temporary
                border-color:     $background
                border-left:      1px solid $background-darker
                background-color: $background
                color:            white

                .icon
                    fill: white
                
                .plus
                    margin-top:  -2px
                    font-size:   16px
                    line-height: 16px
    
    .straight-forks-container
        display:         flex
        justify-content: center
        align-items:     center
        position:        relative
        margin-bottom:   space.$default-padding
    
        .straight-fork-button
            display:         flex
            justify-content: center
            align-items:     center
            padding:         6px 0
            width:           space.$load-save-button-width
            border-top:      1px solid $background-lighter
            border-bottom:   1px solid $background-lighter
            font-size:       14px
            font-weight:     450
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
                margin-right: 11px
                margin-left:  -1px
                height:       15px
                fill:         $background-lightest

            &:hover
                background-color: $background-darker
                color:            $off-white

                .icon
                    fill: $off-white
            
            &:active
                background-color: color.adjust($background-darker, $lightness: -1%)

            &.active
                border-color:     $blue
                background-color: $blue
                color:            $background-darker

                .icon
                    fill: $background-darker

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
            position:        relative
            top:             0
            margin-bottom:   16px
            width:           40px
            height:          40px
            box-sizing:      border-box
            border-radius:   8px
            border:          1px solid $background-lighter
            transition:      background-color easing.$quart-out 0.1s, border-color easing.$quart-out 0.1s, top easing.$quart-out 0.125s
            cursor:          pointer

            &:last-of-type
                margin-bottom: 0
            
            .icon
                fill:       $background-lightest
                color:      $background-lightest
                transition: fill easing.$quart-out 0.1s, color easing.$quart-out 0.1s

            &:hover,
            &:active
                transition: none

                .icon
                    fill:       $background-darker
                    color:      $background-darker
                    transition: none

            &.add
                transition: top easing.$quart-out 0.25s

                .icon
                    height:    11px
                    transform: rotate(45deg)
                &:hover
                    border-color:     $blue
                    background-color: $blue
                &:active
                    border-color:     color.adjust($blue, $lightness: -3%)
                    background-color: color.adjust($blue, $lightness: -3%)
        
            &.retry
                .icon
                    height: 18px
                &:hover
                    border-color:     white
                    background-color: white
                &:active
                    border-color:     color.adjust($off-white, $lightness: -6%)
                    background-color: color.adjust($off-white, $lightness: -6%)
                
            &.delete
                .icon
                    height: 12.5px
                &:hover
                    border-color:     $coral
                    background-color: $coral
                &:active
                    border-color:     color.adjust($coral, $lightness: -4%)
                    background-color: color.adjust($coral, $lightness: -4%)

            &.fork
                .icon
                    height:    13.5px
                    transform: rotate(45deg)
                &:hover
                    border-color:     $blue
                    background-color: $blue
                &:active
                    border-color:     color.adjust($blue, $lightness: -3%)
                    background-color: color.adjust($blue, $lightness: -3%)
    
    .provisional-fork-controls
        position:    absolute
        bottom:      0
        left:        100%
        margin-left: space.$default-padding
    
        .provisional-fork-button
            display:         flex
            justify-content: center
            align-items:     center
            padding-right:   20px
            padding-left:    0
            border-radius:   8px
            border:          1px solid $background-lighter
            color:           $background-lightest
            white-space:     nowrap
            cursor:          pointer

            .icon-container
                display:         flex
                justify-content: center
                align-items:     center
                width:           48px
                height:          48px

            .icon
                fill: $background-lightest

            &:hover,
            &:active
                color: $background-darker

                .icon
                    fill: $background-darker
            
            &.add-reply
                margin-bottom: 16px
                .icon
                    height:    11px
                    transform: rotate(45deg)
                &:hover
                    border-color:     $blue
                    background-color: $blue
                &:active
                    border-color:     color.adjust($blue, $lightness: -3%)
                    background-color: color.adjust($blue, $lightness: -3%)

            &.cancel-fork
                .icon
                    height: 19px
                &:hover
                    border-color:     $coral
                    background-color: $coral
                &:active
                    border-color:     color.adjust($coral, $lightness: -3%)
                    background-color: color.adjust($coral, $lightness: -3%)

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
