<script>
    import { createEventDispatcher } from 'svelte'
    import { fly, slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { save_status } from '$lib/stores/prompt_editor'

    const dispatch = createEventDispatcher()

    export let prompt,
               index,
               active

    $: excerpt = prompt.message.length < 100 ? prompt.message : prompt.message.substring(0,99) + '...'
    $: provisional = !prompt.id

    const clicked = () => dispatch('selectPrompt', { index })

    //  don't animate when a new prompt is being saved, just insta-switch
    const inDuration = () => prompt.id ? 0 : $save_status === 'idle' ? 125 : 0
    const outDuration = () => $save_status === 'idle' ? 250 : 0
</script>

<button
    class='prompt-list-button'
    class:active={active}
    class:provisional={provisional}
    class:delete-highlight={prompt.delete_highlight}
    on:click={clicked}
    in:fly={{ x: -24, opacity: 0, delay: 100, duration: inDuration(), easing: quartOut }}
    out:slide={{ duration: outDuration(), easing: quartOut }}
>
    <div class='title'>
        {#if prompt.title}
            {prompt.title}
        {:else}
            <span class='new-prompt-text'>
                New Prompt
            </span>
        {/if}
        {#if prompt.default}
            <span class='default-text'>
                (default)
            </span>
        {/if}
    </div>
    <div class='message'>
        {excerpt.trim().length > 0 ? excerpt : '...'}
    </div>
</button>

<style lang='sass'>
    .prompt-list-button
        position:         relative
        margin-bottom:    space.$default-padding
        width:            100%
        box-sizing:       border-box
        padding:          30px space.$default-padding
        border-radius:    8px
        background-color: $background-lighter
        color:            $off-white
        text-align:       left
        line-height:      1.6
        cursor:           pointer

        .title
            margin-bottom: 12px
            font-weight:   600
            color:         $yellow

            .default-text
                margin-left: 3px
                font-weight: 400
                color:       $blue-grey
            
            .new-prompt-text
                font-style: italic
        
        .message
            font-size: 14px
        
        &:hover
            box-shadow: 0 0 0 2px white
            transition: none

        &:active
            box-shadow:       0 0 0 2px $off-white
            background-color: color.adjust($background-lighter, $lightness: -1%)
        
        &.active
            box-shadow: 0 0 0 2px $blue
        
            &.provisional
                box-shadow: 0 0 0 2px $yellow

                &.delete-highlight
                    box-shadow: 0 0 0 2px $coral
        
        &.delete-highlight
            box-shadow:       0 0 0 2px $coral
            background-color: $delete-highlight-bg
            text-decoration:  line-through
</style>
