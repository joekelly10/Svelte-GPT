<script>
    import { slide, fly, fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { deleting, provisionally_forking } from '$lib/stores/chat'
    import { api_status } from '$lib/stores/ai'
    import { marked } from 'marked'

    import MessageControls from '$lib/components/Chat/MessageControls.svelte'
    import ProvisionalForkControls from '$lib/components/Chat/ProvisionalForkControls.svelte'
    import MessageInfo from '$lib/components/Chat/MessageInfo.svelte'
    import SiblingForks from '$lib/components/Chat/SiblingForks.svelte'
    import StraightForks from '$lib/components/Chat/StraightForks.svelte'

    marked.use({ breaks: true, mangle: false, headerIds: false })

    export let message

    let show_info   = false,
        show_copied = false,
        copy_timer  = null

    $: streaming = message.is_last && message.role === 'assistant' && $api_status === 'streaming'

    const copyMessageToClipboard = async () => {
        clearTimeout(copy_timer)
        await navigator.clipboard.writeText(message.content)
        show_copied = true
        copy_timer = setTimeout(() => { show_copied = false }, 2000)
    }
</script>

<div
    id='message-{message.id}'
    class='message {message.role}'
    class:streaming={streaming}
    class:delete-highlight={message.delete_highlight}
    class:regenerate-highlight={message.regenerate_highlight}
    class:add-reply-highlight={message.add_reply_highlight}
    out:slide={{ duration: $deleting ? 250 : 0, easing: quartOut }}
    in:slide={{ delay: $deleting ? 500 : 0, duration: $deleting ? 250 : 0, easing: quartOut }}
>
    {#if message.role === 'assistant' && $api_status !== 'streaming' && !$provisionally_forking}
        <MessageControls
            bind:message
            on:addReply
            on:regenerateReply
            on:deleteOne
            on:deleteBoth
            on:forkFrom
        />
    {:else if $provisionally_forking && message.is_last}
        <ProvisionalForkControls
            bind:message
            on:addReply
            on:cancelProvisionalFork
        />
    {/if}

    {#if show_info}
        <MessageInfo
            message={message}
        />
    {/if}

    <div class='avatar-container'>
        {#if message.role === 'user'}
            <img
                class='avatar user'
                src='/img/avatar.png'
                alt='You'
                on:dblclick={copyMessageToClipboard}
            >
        {:else}
            <img
                class='avatar gpt'
                src='/img/icons/models/{message.model.icon}'
                alt='{message.model.name}'
                on:mouseenter={() => { show_info = true }}
                on:mouseleave={() => { show_info = false }}
                on:dblclick={copyMessageToClipboard}
            >
        {/if}
        {#if show_copied}
            <div
                class='copied-feedback'
                in:fly={{ y: 8, duration: 100, easing: quartOut }}
                out:fade={{ duration: 100, easing: quartOut }}
            >
                Message copied!
            </div>
        {/if}
    </div>

    <div class='content'>
        {@html marked(message.content)}
    </div>
</div>

{#if message.role === 'user' && message.forks.length > 1}
    <SiblingForks
        message={message}
        on:switchToFork
    />
{/if}

{#if message.role === 'assistant' && message.forks.length > 0}
    <StraightForks
        message={message}
        on:switchToFork
    />
{/if}

<style lang='sass'>
    .message
        position:     relative
        margin:       1px 0
        padding:      space.$default-padding
        padding-left: space.$avatar-container-width
        border:       0px solid transparent
        transition:   padding-bottom easing.$quart-out 0.25s, border-bottom easing.$quart-out 0.25s, background-color easing.$quart-out 0.125s
        +shared.code_block_styles

        &:first-of-type
            margin-top: space.$default-padding

        &.user
            border-radius:    8px 8px 0 0
            background-color: $background-lighter

            &.delete-highlight
                background-color: color.adjust($delete-highlight-bg, $alpha: -0.4)
                transition:       none
                text-decoration:  line-through
            
            &.add-reply-highlight
                z-index:          999
                box-shadow:       0 0 0 2px $blue
                border-radius:    8px 8px 1px 1px
                background-color: $regenerate-highlight-bg
                transition:       none

        &.assistant
            margin-bottom:    space.$default-padding
            border-radius:    0 0 8px 8px
            background-color: $background-lighter

            &.delete-highlight
                box-shadow:       0 0 0 2px $coral
                border-radius:    1px 1px 8px 8px
                background-color: $delete-highlight-bg
                text-decoration:  line-through
                transition:       none
            
            &.regenerate-highlight
                box-shadow:       0 0 0 2px $blue
                border-radius:    1px 1px 8px 8px
                background-color: $regenerate-highlight-bg
                text-decoration:  line-through
                transition:       none
        
        &.streaming
            padding-bottom: 1.25 * space.$default-padding
            animation:      streaming 1.5s linear infinite
    
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
        user-select:     none

        .avatar
            height:     32px
            transition: transform easing.$quart-out 0.125s
            cursor:     pointer

            &.user
                border-radius: 8px

            &:hover
                transform:  scale(1.1)
                transition: none
            
            &:active
                transform:  scale(1.05)
                transition: none
        
        .copied-feedback
            position:         absolute
            bottom:           100%
            left:             50%
            transform:        translate(-50%, 4px)
            padding:          12px 24px
            border-radius:    8px
            background-color: $background-darker
            font-size:        14px
            font-weight:      500
            line-height:      1.6
            color:            $off-white
            white-space:      nowrap

            &:after
                content:        ''
                position:       absolute
                top:            100%
                left:           50%
                transform:      translateX(-50%)
                border-width:   8px
                border-style:   solid
                border-color:   $background-darker transparent transparent

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
