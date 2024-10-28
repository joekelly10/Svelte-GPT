<script>
    import { createEventDispatcher } from 'svelte'
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { messages } from '$lib/stores/chat'
    import { system_prompts, save_status } from '$lib/stores/prompt_editor'

    const dispatch = createEventDispatcher()

    export let read_only,
               current_prompt_index,
               input_title,
               input_message
    
    let title_input,
        token_count,
        update_timer,
        token_timer,
        copy_timer

    let copy_button_text = 'Copy',
        save_button_text = 'Save'

    $: prompt = $system_prompts[current_prompt_index]
    $: is_currently_active = prompt?.id === $messages[0].system_prompt_id
    $: titleChanged(input_title)
    $: messageChanged(input_message)
    
    $: if (is_currently_active) {
        save_button_text = prompt.modified ? 'Save Changes' : 'Keep Using'
    } else {
        save_button_text = prompt?.modified ? 'Save & Use' : 'Use Prompt'
    }

    export const focusTitle = () => title_input.focus()

    export const save = async () => {
        if (read_only || $save_status !== 'idle') return

        if (input_title.trim().length === 0) return alert('Prompt must have a title!')
        if (input_message.trim().length === 0) return alert('Prompt must have a message!')

        console.log(`💾 Saving system prompt (${input_title}):\n\n`, input_message)
        $save_status = 'saving'

        const response = await fetch(`/api/system-prompts/save`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                deactivate: {
                    id: $messages[0].system_prompt_id
                },
                save_and_activate: {
                    id:      prompt.id,
                    title:   input_title,
                    message: input_message
                }
            })
        })
        
        if (response.ok) {
            console.log(`💾–✅ System prompt saved.`)
            const data = await response.json()
            $messages[0] = {
                ...$messages[0],
                system_prompt_id:    data.id,
                system_prompt_title: data.title,
                is_default:          data.default,
                content:             data.message
            }
            setTimeout(() => {
                $system_prompts[current_prompt_index] = data
                $save_status = 'saved'
                setTimeout(() => dispatch('close'), prompt.modified ? 500 : 0)
            }, prompt.modified ? 250 : 0)
        } else {
            console.log(`💾–❌ Save failed: ${response.status} ${response.statusText}`)
            const json = await response.json()
            if (json) console.log(json)
            $save_status = 'idle'
        }
    }

    const cancel = () => {
        if ($save_status === 'idle') dispatch('cancel')
    }

    const deletePrompt = () => {
        if (prompt.default) {
            alert(`You can't delete the default prompt.`)
        } else if ($save_status === 'idle' && confirm('Are you sure you want to delete this prompt?')) {
            dispatch('deletePrompt')
        }
    }

    const copy = async () => {
        clearTimeout(copy_timer)
        await navigator.clipboard.writeText(input_message)
        copy_button_text = 'Copied!'
        copy_timer = setTimeout(() => { copy_button_text = 'Copy' }, 2000)
    }

    const getTokenCount = async () => {
        clearTimeout(token_timer)

        token_timer = setTimeout(async () => {
            const response = await fetch(`/api/system-prompts/token-count`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ message: input_message })
            })
            const data = await response.json()
            token_count = data.token_count
        }, 250)
    }

    const titleChanged = (_) => {
        clearTimeout(update_timer)
        update_timer = setTimeout(updatePromptInList, 250)
    }

    const messageChanged = (_) => {
        getTokenCount()
        clearTimeout(update_timer)
        update_timer = setTimeout(updatePromptInList, 250)
    }

    const updatePromptInList = () => {
        $system_prompts[current_prompt_index].title    = input_title
        $system_prompts[current_prompt_index].message  = input_message
        $system_prompts[current_prompt_index].modified = input_title !== prompt.original_title || input_message !== prompt.original_message
    }

    const hoveredDelete   = () => {
        $system_prompts[current_prompt_index].delete_highlight = true
    }

    const unhoveredDelete = () => {
        $system_prompts[current_prompt_index].delete_highlight = false
    }

    const clickedSaveButton = () => {
        if (is_currently_active && !prompt.modified) return cancel()
        save()
    }
</script>

<div class='prompt-input-container' class:read-only={read_only} class:delete-highlight={prompt?.delete_highlight}>
    <input
        class='title-input'
        bind:this={title_input}
        bind:value={input_title}
        placeholder='Prompt title'
        disabled={read_only}
    >

    <textarea
        class='prompt-input'
        bind:value={input_message}
        placeholder='Prompt message'
        disabled={read_only}
    ></textarea>

    <div class='controls'>
        <div class='token-count'>
            {#if token_count}
                {token_count} {token_count === 1 ? 'token' : 'tokens'}
            {/if}
        </div>
        <div class='buttons'>
            {#if read_only}
                <button class='close-button' on:click={cancel}>Close</button>
                <button class='copy-button' on:click={copy}>{copy_button_text}</button>
            {:else}
                {#if $save_status === 'idle'}
                    <button class='delete-button' on:click={deletePrompt} on:mouseenter={hoveredDelete} on:mouseleave={unhoveredDelete} out:fade={{ duration: 125, easing: quartOut }}>Delete</button>
                    <button class='cancel-button' on:click={cancel} out:fade={{ duration: 125, easing: quartOut }}>Cancel</button>
                {/if}
                <button class='save-button {$save_status}' class:no-changes={is_currently_active && !prompt.modified} class:modified={prompt?.modified} on:click={clickedSaveButton}>
                    <span class='save-text'>{save_button_text}</span>
                    <div class='spinner'>
                        <img class='spinner-img' src='/img/icons/cog.png' alt='Saving'>
                    </div>
                    <span class='saved-text'>Saved!</span>
                </button>
            {/if}
        </div>
    </div>
</div>

<style lang='sass'>
    .prompt-input-container
        display:          flex
        flex-direction:   column
        position:         relative
        width:            640px
        height:           space.$edit-prompt-form-height
        box-sizing:       border-box
        padding:          space.$default-padding
        border-radius:    8px
        background-color: $background-darkest

        &.read-only
            .title-input,
            .prompt-input
                border-color:     $background-lighter
                background-color: $background
                color:            color.adjust($off-white, $alpha: -0.5)
                cursor:           not-allowed

                &::-webkit-scrollbar-thumb
                    background: color.adjust($off-white, $alpha: -0.67)

        &.delete-highlight
            .title-input,
            .prompt-input
                box-shadow:       0 0 0 1px $coral
                border-color:     $coral
                background-color: $delete-highlight-bg
                text-decoration:  line-through

    .title-input
        flex-grow:        0
        width:            100%
        box-sizing:       border-box
        padding:          16px 24px
        border-radius:    8px
        border:           1px solid $blue-grey
        background-color: $background-lighter
        line-height:      1.6
        font-family:      font.$sans-serif
        font-size:        20px
        font-weight:      600
        color:            $off-white
        caret-color:      $blue

        &::placeholder
            color:       $blue-grey
            font-weight: 500

    .prompt-input
        flex-grow:        1
        margin-top:       space.$default-padding
        width:            100%
        box-sizing:       border-box
        padding:          24px
        border-radius:    8px
        border:           1px solid $blue-grey
        background-color: $background-lighter
        line-height:      1.6
        font-family:      font.$sans-serif
        font-size:        16px
        color:            $off-white
        caret-color:      $blue
        resize:           none

        &::placeholder
            color: $blue-grey

        &::-webkit-scrollbar
            width:      8px
            height:     8px
            background: transparent

        &::-webkit-scrollbar-thumb
            background:    white
            border-radius: 99px
            cursor:        grab

    .controls
        display:         flex
        justify-content: space-between
        align-items:     center
        flex-grow:       0
        margin-top:      space.$default-padding

        .token-count
            margin-left: 16px
            font-size:   14px
            color:       $background-lightest

        .buttons
            display: flex
            gap:     12px

            > button
                display:       block
                padding:       16px space.$default-padding
                border:        none
                border-radius: 8px
                font-family:   font.$sans-serif
                font-size:     14px
                font-weight:   600
                transition:    background-color easing.$quart-out 0.125s
                cursor:        pointer

            .delete-button
                padding-right:    space.$default-padding + 1px
                background-color: transparent
                font-weight:      400
                color:            $background-lightest
                &:hover
                    padding-right:    space.$default-padding
                    background-color: $coral
                    font-weight:      600
                    color:            $background-darkest
                    transition:       none
                &:active
                    padding-right:    space.$default-padding
                    background-color: color.adjust($coral, $lightness: -4%)
                    font-weight:      600
                    color:            $background-darkest
                    transition:       none

            .cancel-button,
            .close-button
                background-color: $background
                color:            $off-white
                &:hover
                    background-color: color.adjust($background, $lightness: 4%)
                    color:            $off-white
                &:active
                    background-color: color.adjust($background, $lightness: 2%)

            .copy-button
                background-color: color.adjust($off-white, $alpha: -0.04)
                color:            $background-darkest
                &:hover
                    background-color: color.adjust($off-white, $alpha: -0.08)
                &:active
                    background-color: color.adjust($off-white, $alpha: -0.12)

            .save-button
                position:         relative
                background-color: $blue
                color:            $background-darkest

                .spinner
                    position:  absolute
                    top:       50%
                    left:      50%
                    transform: translateX(-50%) translateY(-9px)
                    opacity:   0

                    .spinner-img
                        height: 19px
                        filter: brightness(0)

                .saved-text
                    display: none

                &:hover
                    background-color: color.adjust($blue, $lightness: -4%)

                &:active
                    background-color: color.adjust($blue, $lightness: -6%)
                
                &.modified
                    background-color: $yellow
                    &:hover
                        background-color: color.adjust($yellow, $lightness: -5%)
                    &:active
                        background-color: color.adjust($yellow, $lightness: -10%)
                
                &.no-changes
                    background-color: $off-white
                    &:hover
                        background-color: color.adjust($off-white, $alpha: -0.08)
                    &:active
                        background-color: color.adjust($off-white, $alpha: -0.12)

                &.saving
                    pointer-events: none
                    .save-text
                        opacity: 0
                    .spinner
                        opacity: 1
                        .spinner-img
                            animation: animation.$spinner-animation

                &.saved
                    background-color: $blue
                    pointer-events:   none
                    .save-text
                        display: none
                    .saved-text
                        display: block
</style>
