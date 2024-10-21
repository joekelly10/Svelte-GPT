<script>
    import { createEventDispatcher, tick } from 'svelte'
    import { slide, fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { messages } from '$lib/stores/chat'

    const dispatch = createEventDispatcher()

    export let message

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

    const clickedAddReply   = () => dispatch('addReply', { message_id: message.parent_id })
    const clickedRegenerate = () => dispatch('regenerateReply')
    const clickedDelete     = () => dispatch(message.has_siblings ? 'deleteOne' : 'deleteBoth')
    const clickedFork       = () => dispatch('forkFrom', { message_id: message.id })
</script>

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
        <button class='message-control-button fork' title='Fork' on:click={clickedFork}>
            <svg class='icon' viewBox='22 30 53 40'><path d='M74.191 50.855a2.3 2.3 0 0 0 .168-.855c0-.301-.063-.59-.168-.856l-.012-.035a2.3 2.3 0 0 0-.508-.766l-17.676-17.68a2.343 2.343 0 0 0-3.312 3.313l13.676 13.68H24.671a2.345 2.345 0 0 0 0 4.688h41.688L52.683 66.018a2.343 2.343 0 0 0 3.312 3.313l17.676-17.676q.331-.33.508-.766c.008-.011.008-.023.012-.035z'/></svg>
        </button>
    {/if}
</div>

<style lang='sass'>
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
        margin-top:      16px
        width:           40px
        height:          40px
        box-sizing:      border-box
        border-radius:   8px
        border:          1px solid $background-lighter
        cursor:          pointer
        transition:      background-color easing.$quart-out 0.1s, border-color easing.$quart-out 0.1s
        
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
            .icon
                height:    11px
                transform: rotate(45deg)
            &:hover
                border-color:     $blue
                background-color: $blue
                // hack/fix: when adding a 6th reply, the forks expand on hover
                // moving the button down, so we need to compensate for that
                // with a run-off area above:
                &:before
                    content:   ''
                    position:  absolute
                    top:       0
                    left:      -1px
                    width:     40px
                    height:    56px
                    transform: translateY(-46px)
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
</style>
