<script>
    import { createEventDispatcher } from 'svelte'
    import { fly, slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { save_status } from '$lib/stores/prompt_editor'

    const dispatch = createEventDispatcher()

    export let prompt,
               index,
               selected,
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
    class:selected={selected}
    class:provisional={provisional}
    class:modified={prompt.modified}
    class:delete-highlight={prompt.delete_highlight}
    on:click={clicked}
    in:fly={{ x: -24, opacity: 0, delay: 100, duration: inDuration(), easing: quartOut }}
    out:slide={{ duration: outDuration(), easing: quartOut }}
>
    <div class='title'>
        {#if prompt.title}
            {prompt.title}
        {:else}
            <span class='untitled-prompt-text'>
                Untitled Prompt
            </span>
        {/if}
    </div>
    <div class='tags'>
        {#if prompt.default}
            <span class='tag default-tag'>
                default
            </span>
        {/if}
        {#if active}
            <span class='tag active-tag'>
                using now
            </span>
        {/if}
        {#if provisional}
            <span class='tag provisional-tag'>
                new
            </span>
        {:else if prompt.modified}
            <span class='tag modified-tag'>
                modified
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
            font-weight: 600
            color:       $yellow

            .untitled-prompt-text
                font-style:  italic
                font-weight: 500
                color:       $blue-grey

        .tags
            margin-top: 6px

            .tag
                display:          inline-block
                margin-right:     4px
                padding:          0 4px
                border-radius:    4px
                background-color: $off-white
                font-size:        10.5px
                font-weight:      700
                text-transform:   uppercase
                color:            $background-darkest

                &.default-tag
                    background-color: $blue-grey

                &.active-tag
                    background-color: $off-white

                &.modified-tag
                    background-color: $yellow

                &.provisional-tag
                    background-color: $yellow

        .message
            margin-top: 12px
            font-size:  14px

        &:hover
            box-shadow: 0 0 0 2px white
            transition: none

        &:active
            box-shadow:       0 0 0 2px $off-white
            background-color: color.adjust($background-lighter, $lightness: -1%)

        &.selected
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
