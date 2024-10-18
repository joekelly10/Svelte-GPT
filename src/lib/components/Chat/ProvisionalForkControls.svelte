<script>
    import { createEventDispatcher, tick } from 'svelte'
    import { fly } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { messages } from '$lib/stores/chat'

    const dispatch = createEventDispatcher()

    export let message

    $: parent_index = $messages.findIndex(m => m.id === message.parent_id)

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

    const clickedAddReply   = () => dispatch('addReply', { message_id: message.parent_id })
    const clickedCancelFork = () => dispatch('cancelProvisionalFork')
</script>

<div class='provisional-fork-controls' in:fly={{ x: -32, delay: 100, duration: 250, easing: quartOut }}>
    <button class='provisional-fork-button add-reply' title='Add another reply' on:click={clickedAddReply} on:mouseenter={hoveredAddReply} on:mouseleave={unhoveredAddReply}>
        <div class='icon-container'>
            <svg class='icon' viewBox='0 0 7 7'><path d='m.5.5 6 6m0-6-6 6' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round'/></svg>
        </div>
        Add Reply
    </button>
    <button class='provisional-fork-button cancel-fork' title='Cancel Fork (esc)' on:click={clickedCancelFork}>
        <div class='icon-container'>
            <svg class='icon' enable-background='new 0 0 24 24' viewBox='0 0 24 24' id='close'><path d='M13.4,12l6.3-6.3c0.4-0.4,0.4-1,0-1.4c-0.4-0.4-1-0.4-1.4,0L12,10.6L5.7,4.3c-0.4-0.4-1-0.4-1.4,0c-0.4,0.4-0.4,1,0,1.4 l6.3,6.3l-6.3,6.3C4.1,18.5,4,18.7,4,19c0,0.6,0.4,1,1,1c0.3,0,0.5-0.1,0.7-0.3l6.3-6.3l6.3,6.3c0.2,0.2,0.4,0.3,0.7,0.3 s0.5-0.1,0.7-0.3c0.4-0.4,0.4-1,0-1.4L13.4,12z'></path></svg>
        </div>
        Cancel Fork
    </button>
</div>

<style lang='sass'>
    .provisional-fork-controls
        position:    absolute
        bottom:      0
        left:        100%
        margin-left: space.$default-padding
    
    .provisional-fork-button
        display:         flex
        justify-content: center
        align-items:     center
        margin-top:      16px
        padding:         0
        padding-right:   20px
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
</style>
