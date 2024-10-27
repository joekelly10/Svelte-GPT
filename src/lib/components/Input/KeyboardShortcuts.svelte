<script>
    import { shortcuts_active } from '$lib/stores/chat'
    import KeyboardShortcutsList from '$lib/components/Input/KeyboardShortcutsList.svelte'

    const toggleShortcuts = () => $shortcuts_active = !$shortcuts_active
</script>

<button class='shortcuts-button' class:active={$shortcuts_active} on:click={toggleShortcuts}>
    <strong class='shortcut'>⌘ /</strong>
    Keys
</button>

{#if $shortcuts_active}
    <KeyboardShortcutsList/>
{/if}

<style lang='sass'>
    .shortcuts-button
        position:      absolute
        top:           50%
        left:          16px
        transform:     translateY(-50%)
        padding:       24px space.$default-padding
        border-radius: 8px
        line-height:   1.6
        text-align:    left
        font-size:     14px
        color:         $background-lightest
        cursor:        pointer

        .shortcut
            margin-right: 8px
            font-weight:  600

        &:hover
            background-color: $background-darkest
            font-weight:      600
            color:            $off-white

            .shortcut
                color: $blue
        
        &:active
            background-color: color.adjust($background-darkest, $lightness: -1%)
            font-weight:      600
            color:            $off-white
        
        &.active
            background-color: $background-darkest
            font-weight:      600
            color:            $off-white

            .shortcut
                color: $blue
            
            &:hover
                background-color: color.adjust($background-darkest, $lightness: -1%)
            
            &:active
                background-color: color.adjust($background-darkest, $lightness: -2%)
</style>
