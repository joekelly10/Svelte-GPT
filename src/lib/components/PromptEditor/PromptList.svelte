<script>
    import { createEventDispatcher, tick } from 'svelte'
    import { system_prompts } from '$lib/stores/prompt_editor'
    import PromptListButton from '$lib/components/PromptEditor/PromptListButton.svelte'

    const dispatch = createEventDispatcher()

    export let current_prompt_index

    let list

    $: new_prompt_already_created = !$system_prompts[0]?.id

    const createPrompt = async () => {
        if (new_prompt_already_created) {
            dispatch('selectPrompt', { index: 0 })
            return
        }

        $system_prompts = [
            {
                id:      null,
                title:   '',
                message: ''
            },
            ...$system_prompts
        ]

        dispatch('selectPrompt', { index: 0 })
        list.scrollTo({ top: 0, behavior: 'smooth' })
    }
</script>

<div class='prompt-list'>
    <div class='header'>
        {$system_prompts.length} prompts
        <button class='create-button' on:click={createPrompt}>
            <svg class='icon' viewBox='0 0 7 7'><path d='m.5.5 6 6m0-6-6 6' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round'/></svg>
        </button>
    </div>
    <div class='list' bind:this={list}>
        {#each $system_prompts as prompt, i (prompt.id)}
            <PromptListButton
                prompt={prompt}
                index={i}
                active={i === current_prompt_index}
                on:selectPrompt
            />
        {/each}
    </div>
</div>

<style lang='sass'>
    .prompt-list
        display:         flex
        flex-direction:  column
        align-items:     center
        justify-content: flex-start
        width:           390px
        height:          space.$edit-prompt-form-height + 128px

    .header
        display:          flex
        align-items:      center
        justify-content:  space-between
        width:            100%
        box-sizing:       border-box
        padding:          20px space.$default-padding
        border-radius:    8px 8px 0 0
        background-color: $background-darkest
        font-weight:      600
        color:            $off-white

        .create-button
            display:         flex
            align-items:     center
            justify-content: center
            width:           40px
            height:          40px
            border-radius:   8px
            border:          1px solid $background-lighter
            color:           $background-lightest
            cursor:          pointer
            transition:      border-color easing.$quart-out 0.125s, background-color easing.$quart-out 0.125s, color easing.$quart-out 0.125s

            .icon
                height:    11px
                transform: rotate(45deg)
            
            &:hover
                border-color:     $yellow
                background-color: $yellow
                color:            $background-darkest
                transition:       none
        
            &:active
                border-color:     color.adjust($yellow, $lightness: -10%)
                background-color: color.adjust($yellow, $lightness: -10%)
                color:            $background-darkest
                transition:       none

    .list
        display:          flex
        flex-direction:   column
        align-items:      flex-start
        justify-content:  flex-start
        width:            100%
        box-sizing:       border-box
        padding:          space.$default-padding
        padding-bottom:   space.$default-padding * 3
        border-radius:    0 0 8px 8px
        border:           1px solid $background-darkest
        background-color: color.adjust($background-darkest, $alpha: -0.67)
        overflow-y:       auto
        overflow-x:       hidden
        &::-webkit-scrollbar
            width:            0px
            height:           0px
            background-color: transparent
        &::-webkit-scrollbar-thumb
            background-color: transparent
            &:hover
                background-color: transparent
            &:active
                background-color: transparent
        &::-webkit-scrollbar-corner
            display: none
</style>
