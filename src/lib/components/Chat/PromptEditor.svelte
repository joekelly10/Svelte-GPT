<script>
    import { scale } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { prompt_editor_active, messages } from '$lib/stores/chat'
    import { onMount, onDestroy } from 'svelte'

    let input_content,
        token_count,
        token_timer,
        read_only,
        copy_timer,
        copyButtonText = 'Copy'

    $: {
        if (input_content) getTokenCount()
        read_only = $messages.length > 1
    }

    const getTokenCount = async () => {
        clearTimeout(token_timer)

        token_timer = setTimeout(async () => {
            const response = await fetch(`/api/system-prompts/token-count`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ message: input_content })
            })
            const data = await response.json()
            token_count = data.token_count
        }, 250)
    }

    const close = () => $prompt_editor_active = false

    const save = async () => {
        if (read_only) return

        $messages[0].content = input_content

        console.log(`💾 Saving system prompt: ${input_content}`)
        const response = await fetch(`/api/system-prompts/save`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                id:      $messages[0].system_prompt_id,
                message: input_content,
                active:  true
            })
        })
        
        if (response.ok) {
            console.log(`💾–✅ System prompt saved.`)
        } else {
            console.log(`💾–❌ Save failed: ${response.status} ${response.statusText}`)
            const json = await response.json()
            if (json) console.log(json)
        }

        close()
    }

    const copy = async () => {
        clearTimeout(copy_timer)
        await navigator.clipboard.writeText(input_content)
        copyButtonText = 'Copied!'
        copy_timer = setTimeout(() => { copyButtonText = 'Copy' }, 2500)
    }

    const keydown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault()
            return close()
        }
        if (e.metaKey && e.key === 'Enter') {
            e.preventDefault()
            return save()
        }
    }

    onMount(() => {
        document.addEventListener('keydown', keydown)
        input_content = $messages[0].content
    })

    onDestroy(() => {
        document.removeEventListener('keydown', keydown)
    })
</script>

<div class='prompt-editor' class:read-only={read_only} in:scale={{ start: 1.02, opacity: 0, duration: 200, easing: quartOut }} out:scale={{ start: 1.02, opacity: 0, duration: 100, easing: quartOut }}>
    <div class='inner'>
        <button class='close-prompt-editor-button' on:click={close}>
            <img class='close-icon' src='/img/icons/close-white.png' alt='Close'>
        </button>
        <div class='prompt-input-container'>
            <div class='title'>
                {#if $messages.length === 1}
                    <svg class='icon edit-icon' viewBox='0 0 106.86 122.88'><g><path d='M46.77,116.58c1.74,0,3.15,1.41,3.15,3.15c0,1.74-1.41,3.15-3.15,3.15H7.33c-2.02,0-3.85-0.82-5.18-2.15 C0.82,119.4,0,117.57,0,115.55V7.33c0-2.02,0.82-3.85,2.15-5.18C3.48,0.82,5.31,0,7.33,0h90.02c2.02,0,3.85,0.83,5.18,2.15 c1.33,1.33,2.15,3.16,2.15,5.18v50.14c0,1.74-1.41,3.15-3.15,3.15c-1.74,0-3.15-1.41-3.15-3.15V7.33c0-0.28-0.12-0.54-0.31-0.72 c-0.19-0.19-0.45-0.31-0.72-0.31H7.33c-0.28,0-0.54,0.12-0.73,0.3C6.42,6.8,6.3,7.05,6.3,7.33v108.21c0,0.28,0.12,0.54,0.31,0.72 c0.19,0.19,0.45,0.31,0.73,0.31H46.77L46.77,116.58z M98.7,74.34c-0.51-0.49-1.1-0.72-1.78-0.71c-0.68,0.01-1.26,0.28-1.74,0.78 l-3.91,4.07l10.97,10.59l3.95-4.11c0.47-0.48,0.67-1.1,0.66-1.78c-0.01-0.67-0.25-1.28-0.73-1.74L98.7,74.34L98.7,74.34z M78.21,114.01c-1.45,0.46-2.89,0.94-4.33,1.41c-1.45,0.48-2.89,0.97-4.33,1.45c-3.41,1.12-5.32,1.74-5.72,1.85 c-0.39,0.12-0.16-1.48,0.7-4.81l2.71-10.45l0,0l20.55-21.38l10.96,10.55L78.21,114.01L78.21,114.01z M31.58,41.08 c-1.74,0-3.15-1.41-3.15-3.15s1.41-3.15,3.15-3.15h41.54c1.74,0,3.15,1.41,3.15,3.15s-1.41,3.15-3.15,3.15H31.58L31.58,41.08z M31.58,85.77c-1.74,0-3.16-1.43-3.16-3.19s1.41-3.19,3.16-3.19h20.47c1.74,0,3.16,1.43,3.16,3.19s-1.41,3.19-3.16,3.19H31.58 L31.58,85.77z M31.58,63.41c-1.74,0-3.15-1.41-3.15-3.15s1.41-3.15,3.15-3.15h41.54c1.74,0,3.15,1.41,3.15,3.15 s-1.41,3.15-3.15,3.15H31.58L31.58,63.41z'/></g></svg>
                {:else}
                    <svg class='icon view-icon' viewBox='0 0 122.88 68.18'><defs><style>.cls-1{fill-rule:evenodd}</style></defs><path class='cls-1' d='M61.44,13.81a20.31,20.31,0,1,1-14.34,6,20.24,20.24,0,0,1,14.34-6ZM1.05,31.31A106.72,106.72,0,0,1,11.37,20.43C25.74,7.35,42.08.36,59,0s34.09,5.92,50.35,19.32a121.91,121.91,0,0,1,12.54,12,4,4,0,0,1,.25,5,79.88,79.88,0,0,1-15.38,16.41A69.53,69.53,0,0,1,63.43,68.18,76,76,0,0,1,19.17,53.82,89.35,89.35,0,0,1,.86,36.44a3.94,3.94,0,0,1,.19-5.13Zm15.63-5A99.4,99.4,0,0,0,9.09,34,80.86,80.86,0,0,0,23.71,47.37,68.26,68.26,0,0,0,63.4,60.3a61.69,61.69,0,0,0,38.41-13.72,70.84,70.84,0,0,0,12-12.3,110.45,110.45,0,0,0-9.5-8.86C89.56,13.26,74.08,7.58,59.11,7.89S29.63,14.48,16.68,26.27Zm39.69-7.79a7.87,7.87,0,1,1-7.87,7.87,7.86,7.86,0,0,1,7.87-7.87Z'/></svg>
                {/if}
                <span class='title-text'>
                    System Prompt
                    {#if read_only}
                        <span class='read-only-label'>
                            (Read only)
                        </span>
                    {/if}
                </span>
            </div>
            <textarea
                name='system-prompt'
                class='prompt-input'
                bind:value={input_content}
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
                        <button class='close-button' on:click={close}>Close</button>
                        <button class='copy-button' on:click={copy}>{copyButtonText}</button>
                    {:else}
                        <button class='cancel-button' on:click={close}>Cancel</button>
                        <button class='save-button' on:click={save}>Save</button>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>

<style lang='sass'>
    .prompt-editor
        position:         fixed
        top:              0
        left:             0
        z-index:          99
        width:            100vw
        height:           100vh
        background-color: color.adjust($background-darker, $alpha: -0.125)

        &.read-only
            .prompt-input
                border-color:     $background-lighter
                background-color: $background
                color:            color.adjust($off-white, $alpha: -0.5)
                cursor:           not-allowed

                &::-webkit-scrollbar-thumb
                    background: color.adjust($off-white, $alpha: -0.67)
    
    .inner
        position:       relative
        height:         100%
        box-sizing:     border-box
        padding-bottom: 128px
        overflow-y:     scroll
        +shared.scrollbar
    
    .close-prompt-editor-button
        position:    fixed
        top:         0
        right:       0
        padding:     24px space.$default-padding
        font-weight: 500
        cursor:      pointer

        .close-icon
            height: 16px
        
        &:hover
            .close-icon
                filter: brightness(0.8)
    
    .prompt-input-container
        margin:           80px auto 0
        width:            space.$main-column-width
        max-width:        640px
        box-sizing:       border-box
        padding:          space.$default-padding
        border-radius:    8px
        background-color: $background-darkest

        .title
            display:         flex
            align-items:     center
            justify-content: center

            .icon
                height:       24px
                margin-right: 20px
                fill:         $off-white

                &.view-icon
                    height: 13px

            .title-text
                font-size:   14px
                font-weight: 600
            
            .read-only-label
                margin-left: 6px
                font-size:   14px
                font-weight: 500
                color:       $blue-grey

    .prompt-input
        margin-top:       space.$default-padding
        width:            100%
        height:           400px
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
                cursor:        pointer

            .cancel-button,
            .close-button
                background-color: $background
                color:            $off-white

                &:hover
                    background-color: color.adjust($background, $lightness: 4%)
                    color:            $off-white

                &:active
                    background-color: color.adjust($background, $lightness: 2%)

            .save-button,
            .copy-button
                background-color: $blue
                color:            $background-darkest

                &:hover
                    background-color: color.adjust($blue, $lightness: -4%)

                &:active
                    background-color: color.adjust($blue, $lightness: -6%)
</style>
