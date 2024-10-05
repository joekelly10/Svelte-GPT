<script>
    import { marked } from 'marked'
    import { createEventDispatcher } from 'svelte'
    import { fade, slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { chat_id } from '$lib/stores/chat.js'
    import { formatDate } from '$lib/utils/helpers'

    marked.use({ mangle: false, headerIds: false })

    const dispatch = createEventDispatcher()

    export let chat,
               index,
               keyboard_index,
               suspend_mouse,
               deleting

    let assistant_messages = [],
        models_used        = [],
        delete_highlight   = false

    $: {
        assistant_messages = chat.messages.filter(m => m.role === 'assistant')
        models_used        = getModelsUsed(assistant_messages)
    }

    const getModelsUsed = (messages) => {
        let mdls_used = []
        messages.forEach(message => {
            const index = mdls_used.findIndex(m => m.id === message.model.id)
            if (index === -1) {
                mdls_used.push({ ...message.model, count: 1 })
            } else {
                mdls_used[index].count++
            }
        })
        return mdls_used
    }

    const outDuration = () => deleting ? 300 : 0
</script>

<div class='chat-container' out:slide={{ duration: outDuration(), easing: quartOut }}>
    <button class='chat'
        class:keyboard-highlight={index === keyboard_index}
        class:delete-highlight={delete_highlight}
        class:suspend-mouse-highlight={suspend_mouse}
        on:click={() => dispatch('loadChat', { chat })}
    >
        <div class='date'>
            {@html formatDate(chat.updated)}
            {#if chat.id === $chat_id}
                <span class='active'>
                    (active now)
                </span>
            {/if}
        </div>

        <div class='message'>
            <div class='author-container'>
                <img class='avatar user' src='/img/avatar.png' alt='Joe'>
            </div>

            {@html marked(chat.messages[1].content)}
        </div>

        <div class='message-count'>
            <div class='models-used'>
                {#each models_used as model}
                    <div class='model'>
                        <img class='ai-icon' src='/img/icons/models/{model.icon ?? 'gpt-4o.png'}' alt='{model.name}' title='{model.count} {model.count === 1 ? 'message' : 'messages'}'>
                    </div>
                {/each}
            </div>
            <span class='message-count'>
                {assistant_messages.length} {assistant_messages.length === 1 ? 'message' : 'messages'}
            </span>
            {#if chat.forks.length > 1}
                <span class='fork-count'>
                    <span class='bull'>&bull;</span>
                    {chat.forks.length} forks
                </span>
            {/if}
        </div>
    </button>
    <div class='actions' on:mouseenter={() => { delete_highlight = true }} on:mouseleave={() => { delete_highlight = false }}>
        <button class='action-button delete' title='Delete chat' on:click={() => dispatch('deleteChat', { chat } )}>
            <svg class='icon' xmlns='http://www.w3.org/2000/svg' enable-background='new 0 0 24 24' viewBox='0 0 24 24' id='close'><path d='M13.4,12l6.3-6.3c0.4-0.4,0.4-1,0-1.4c-0.4-0.4-1-0.4-1.4,0L12,10.6L5.7,4.3c-0.4-0.4-1-0.4-1.4,0c-0.4,0.4-0.4,1,0,1.4 l6.3,6.3l-6.3,6.3C4.1,18.5,4,18.7,4,19c0,0.6,0.4,1,1,1c0.3,0,0.5-0.1,0.7-0.3l6.3-6.3l6.3,6.3c0.2,0.2,0.4,0.3,0.7,0.3 s0.5-0.1,0.7-0.3c0.4-0.4,0.4-1,0-1.4L13.4,12z'></path></svg>
        </button>
    </div>
</div>

<style lang='sass'>
    .chat-container
        position:      relative
        margin-bottom: space.$default-padding

    .chat
        width:            100%
        box-sizing:       border-box
        padding:          space.$default-padding
        box-shadow:       0 0 0 0 transparent
        border-radius:    8px
        border:           1px solid $background-lighter
        background-color: $background-lighter
        text-align:       left
        cursor:           pointer
        transition:       box-shadow easing.$quart-out 0.1s
        +shared.code_block_styles

        &:not(.suspend-mouse-highlight)
            &:hover
                box-shadow: 0 0 0 2px white
                transition: none
        
        &:active
            background-color: color.adjust($background-lighter, $lightness: -1.25%)
        
        &.keyboard-highlight
            box-shadow: 0 0 0 2px $blue
            transition: none

        &.delete-highlight
            box-shadow: 0 0 0 2px $coral
            transition: none

    .date
        margin-bottom: space.$default-padding
        font-weight:   600
        color:         $yellow
        
        :global(.bull)
            margin:      0 3px
            font-weight: 700
        
        .active
            margin-left: 8px
            color:       $pale-blue

    .message
        $container-width: 64px
        position:     relative
        padding-left: $container-width

        .author-container
            position:   absolute
            top:        0
            left:       0
            width:      $container-width
            text-align: left

            .avatar
                height: 32px

                &.user
                    border-radius: 8px
    
    .message-count
        margin-top: space.$default-padding
        text-align: right
        color:      $blue-grey

        .models-used
            display:      inline-block
            margin-right: 20px

            .model
                display:     inline-block
                position:    relative
                margin-left: 12px

                &:hover
                    .ai-icon
                        transform:  scale(1.1)
                        transition: none
            
            .ai-icon
                display:        inline-block
                vertical-align: middle
                margin-top:     -3px
                height:         32px
                transition:     transform easing.$quart-out 0.125s

    .fork-count
        .bull
            margin: 0 5px
    
    .actions
        position:    absolute
        bottom:      0
        left:        100%
        margin-left: space.$default-padding
        width:       48px
        
        .action-button
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
                    border-color:     color.adjust($coral, $lightness: -3%)
                    background-color: color.adjust($coral, $lightness: -3%)
                    transition:       none
                    
                    .icon
                        fill:       $background-darker
                        transition: none
    
    :global(.chat.keyboard-highlight.selected)
        background-color: color.adjust($background-lighter, $lightness: -2%)
</style>
