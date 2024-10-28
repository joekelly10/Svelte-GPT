<script>
    import { messages, prompt_editor_active } from '$lib/stores/chat'

    const openPromptEditor = () => $prompt_editor_active = true
</script>

<button
    class='system-prompt-button'
    class:editor-active={$prompt_editor_active}
    on:click={openPromptEditor}
>
    <svg class='icon edit-icon' viewBox='0 0 106.86 122.88'><g><path d='M46.77,116.58c1.74,0,3.15,1.41,3.15,3.15c0,1.74-1.41,3.15-3.15,3.15H7.33c-2.02,0-3.85-0.82-5.18-2.15 C0.82,119.4,0,117.57,0,115.55V7.33c0-2.02,0.82-3.85,2.15-5.18C3.48,0.82,5.31,0,7.33,0h90.02c2.02,0,3.85,0.83,5.18,2.15 c1.33,1.33,2.15,3.16,2.15,5.18v50.14c0,1.74-1.41,3.15-3.15,3.15c-1.74,0-3.15-1.41-3.15-3.15V7.33c0-0.28-0.12-0.54-0.31-0.72 c-0.19-0.19-0.45-0.31-0.72-0.31H7.33c-0.28,0-0.54,0.12-0.73,0.3C6.42,6.8,6.3,7.05,6.3,7.33v108.21c0,0.28,0.12,0.54,0.31,0.72 c0.19,0.19,0.45,0.31,0.73,0.31H46.77L46.77,116.58z M98.7,74.34c-0.51-0.49-1.1-0.72-1.78-0.71c-0.68,0.01-1.26,0.28-1.74,0.78 l-3.91,4.07l10.97,10.59l3.95-4.11c0.47-0.48,0.67-1.1,0.66-1.78c-0.01-0.67-0.25-1.28-0.73-1.74L98.7,74.34L98.7,74.34z M78.21,114.01c-1.45,0.46-2.89,0.94-4.33,1.41c-1.45,0.48-2.89,0.97-4.33,1.45c-3.41,1.12-5.32,1.74-5.72,1.85 c-0.39,0.12-0.16-1.48,0.7-4.81l2.71-10.45l0,0l20.55-21.38l10.96,10.55L78.21,114.01L78.21,114.01z M31.58,41.08 c-1.74,0-3.15-1.41-3.15-3.15s1.41-3.15,3.15-3.15h41.54c1.74,0,3.15,1.41,3.15,3.15s-1.41,3.15-3.15,3.15H31.58L31.58,41.08z M31.58,85.77c-1.74,0-3.16-1.43-3.16-3.19s1.41-3.19,3.16-3.19h20.47c1.74,0,3.16,1.43,3.16,3.19s-1.41,3.19-3.16,3.19H31.58 L31.58,85.77z M31.58,63.41c-1.74,0-3.15-1.41-3.15-3.15s1.41-3.15,3.15-3.15h41.54c1.74,0,3.15,1.41,3.15,3.15 s-1.41,3.15-3.15,3.15H31.58L31.58,63.41z'/></g></svg>
    <div class='button-title'>
        System prompt<br>
        <span class='prompt-title'>
            {$messages[0].system_prompt_title ?? ''}
        </span>
    </div>
</button>

<style lang='sass'>
    .system-prompt-button
        display:       flex
        align-items:   center
        position:      absolute
        top:           50%
        right:         16px
        transform:     translateY(-50%)
        max-width:     320px
        padding:       20px space.$default-padding
        border:        1px solid transparent
        border-radius: 8px
        line-height:   1.6
        font-size:     14px
        color:         $blue-grey
        text-align:    left
        cursor:        pointer

        .icon
            flex-shrink:  0
            margin-right: 16px
            height:       21px
            fill:         $blue-grey

        .prompt-title
            font-weight: 600
            color:       $off-white

        &:hover
            background-color: $background-darkest
            color:            $blue-grey

            .icon
                fill: $blue-grey

            .prompt-title
                color: $off-white
        
        &:active
            background-color: color.adjust($background-darkest, $lightness: -1%)
            color:            $blue-grey

            .icon
                fill: $blue-grey

            .prompt-title
                color: $off-white

        &.editor-active
            border-color: $background-lighter
            color:        $blue-grey

            .icon
                fill: $blue-grey
            
            .prompt-title
                color: $off-white
</style>
