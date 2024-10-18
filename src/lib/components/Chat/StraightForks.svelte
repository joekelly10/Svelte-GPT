<script>
    import { createEventDispatcher } from 'svelte'
    import { fly } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'

    const dispatch = createEventDispatcher()

    export let message

    const clickedFork = (fork) => dispatch('switchToFork', { fork_index: fork.index })
</script>

<div class='straight-forks-container' in:fly={{ y: -20, delay: 100, duration: 250, easing: quartOut }}>
    {#each message.forks as fork, i}
        {#if fork.provisional}
            <button class='straight-fork-button provisional active'>
                <svg class='icon' viewBox='4 4 16 16' transform='scale(1 -1)'><path d='M19.5 4h-4a.5.5 0 0 0 0 1h2.793l-4.147 4.146a.5.5 0 1 0 .707.707L19 5.707V8.5a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-.5-.5M5.707 5H8.5a.5.5 0 0 0 0-1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 1 0V5.707l6.5 6.5V19.5a.5.5 0 0 0 1 0V12a.5.5 0 0 0-.146-.354Z'/></svg>
                {i + 1}
            </button>
        {:else}
            <button class='straight-fork-button' class:active={fork.is_active} on:click={() => clickedFork(fork)}>
                <svg class='icon' viewBox='4 4 16 16' transform='scale(1 -1)'><path d='M19.5 4h-4a.5.5 0 0 0 0 1h2.793l-4.147 4.146a.5.5 0 1 0 .707.707L19 5.707V8.5a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-.5-.5M5.707 5H8.5a.5.5 0 0 0 0-1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 1 0V5.707l6.5 6.5V19.5a.5.5 0 0 0 1 0V12a.5.5 0 0 0-.146-.354Z'/></svg>
                {i + 1}
            </button>
        {/if}
    {/each}
</div>

<style lang='sass'>
    .straight-forks-container
        display:         flex
        justify-content: center
        align-items:     center
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
            border-radius: 8px 0 0 8px
            border-left:   1px solid $background-lighter
        
        &:last-of-type
            border-radius: 0 8px 8px 0
            border-right:  1px solid $background-lighter

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
</style>
