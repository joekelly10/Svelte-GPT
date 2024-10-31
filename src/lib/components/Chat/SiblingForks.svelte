<script>
    import { createEventDispatcher } from 'svelte'
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { api_status } from '$lib/stores/ai'

    const dispatch = createEventDispatcher()

    export let message

    const clickedFork = (fork) => {
        if ($api_status === 'idle') dispatch('switchToFork', { fork_index: fork.index })
    }
</script>

<div class='sibling-forks-container' class:delete-fork-highlight={message.delete_fork_highlight} in:slide={{ delay: 125, duration: 250, easing: quartOut }} out:slide={{ duration: 250, easing: quartOut }}>
    <div class='inner'>
        {#each message.forks as fork, i}
            <button class='sibling-fork-button' class:active={fork.is_active} on:click={() => clickedFork(fork)}>
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
</div>

<style lang='sass'>
    .sibling-forks-container
        display:          flex
        justify-content:  center
        padding:          24px 0
        background-color: $sibling-forks-bg
        user-select:      none
        transition:       background-color easing.$quart-out 0.125s

        &.delete-fork-highlight
            background-color: color.mix($coral, $background-lighter, 10%)
            transition:       none

            .sibling-fork-button
                &.active
                    background-color: $coral
                    border-color:     $coral

        .inner
            display:         flex
            flex-wrap:       wrap
            row-gap:         16px
            justify-content: center
            width:           5 * space.$load-save-button-width

    .sibling-fork-button
        display:          flex
        justify-content:  center
        align-items:      center
        width:            space.$load-save-button-width
        box-sizing:       border-box
        padding:          6px 0
        border-top:       1px solid $background
        border-bottom:    1px solid $background
        background-color: $background
        font-size:        14px
        font-weight:      450
        color:            $background-lightest
        cursor:           pointer
        transition:       border-radius easing.$quart-out 0.125s

        &:nth-child(5n+1)
            border-top-left-radius:    8px
            border-bottom-left-radius: 8px
            border-left:               1px solid $background
        
        &:nth-child(5n),
        &:last-child
            border-top-right-radius:    8px
            border-bottom-right-radius: 8px
            border-right:               1px solid $background

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
            border-left:      1px solid $background-darker
            background-color: $background
            color:            white

            .icon
                fill: white
            
            .plus
                margin-top:  -2px
                font-size:   16px
                line-height: 16px
</style>
