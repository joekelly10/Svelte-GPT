<script>
    import { marked } from 'marked'
    import { createEventDispatcher } from 'svelte'
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { chat_id } from '$lib/stores/chat.js'
    import { formatDate } from '$lib/utils/helpers'

    marked.use({ mangle: false, headerIds: false })

    const dispatch = createEventDispatcher()

    export let chat,
               index,
               keyboard_index

    let message_count
    $: message_count = chat.messages.filter(m => m.role === 'assistant').length
</script>

<button class='chat' class:keyboard-highlight={index === keyboard_index} on:click={() => dispatch('loadChat', { chat })} in:fade={{ delay: index * 10, duration: 125, easing: quartOut }}>
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
        <span class='message-count'>
            {message_count} {message_count === 1 ? 'message' : 'messages'}
        </span>
        {#if chat.forks.length > 1}
            <span class='fork-count'>
                <span class='bull'>&bull;</span>
                {chat.forks.length} forks
            </span>
        {/if}
    </div>
</button>

<style lang='sass'>
    .chat
        margin-bottom:    space.$default-padding
        width:            100%
        box-sizing:       border-box
        padding:          space.$default-padding
        border-radius:    8px
        border:           1px solid $background-lighter
        background-color: $background-lighter
        text-align:       left
        cursor:           pointer
        +shared.code_block_styles

        &:hover
            border-color:     lighten($background-lighter, 2%)
            background-color: lighten($background-lighter, 2%)
            transition:       none
        
        &:active
            background-color: darken($background-lighter, 2%)
        
        &.keyboard-highlight
            box-shadow: 0 0 0 2px $blue

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

        .fork-count
            .bull
                margin: 0 5px
    
    :global(.chat.keyboard-highlight.selected)
        background-color: darken($background-lighter, 2%)
</style>
