<script>
    import { onMount, onDestroy } from 'svelte'
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { shortcuts_active } from '$lib/stores/chat'

    onMount(() => {
        document.addEventListener('keydown', keydown)
    })

    onDestroy(() => {
        document.removeEventListener('keydown', keydown)
    })

    const keydown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault()
            $shortcuts_active = false
        }
    }
</script>

<div class='shortcuts' transition:fade={{ duration: 100, easing: quartOut }}>
    <div class='shortcut-table'>
        <div class='key'>⌘ O</div>
        <span class='command'>Open <span class='old-chat'>(Old Chat)</span></span>
        <div class='key'>⌘ S</div>
        <span class='command'>Save</span>
        <div class='key'>⌃ N</div>
        <span class='command'>New</span>
        <div class='key'>⌘ ⌥ ⌫</div>
        <span class='command'>Delete</span>

        <div class='space'>&nbsp;</div>

        <div class='key'>⌘ M</div>
        <span class='command'>Switch Models</span>
        <div class='key'>⌃ (⇧) T</div>
        <span class='command'>Temperature</span>
        <div class='key'>⌃ (⇧) P</div>
        <span class='command'>Top Percent (top_p)</span>

        <div class='space'>&nbsp;</div>

        <div class='key'>⌥ ⬆ ⬇</div>
        <span class='command'>Scroll Up / Down</span>
        <div class='key'>⇧ ⌥ ⬆ ⬇</div>
        <span class='command'>...to Top / Bottom</span>

        <div class='space'>&nbsp;</div>

        <div class='key'>⬅ ⬆ ⬇ ➡</div>
        <span class='command'>Select <span class='old-chat'>(Old Chat)</span></span>
        <div class='key'>ENTER</div>
        <span class='command'>Load <span class='old-chat'>(Old Chat)</span></span>
        <div class='key'>⌘ ⌫</div>
        <span class='command'>Delete <span class='old-chat'>(Old Chat)</span></span>
    </div>
</div>

<style lang='sass'>
    .shortcuts
        position:         absolute
        top:              0 - space.$default-padding
        left:             space.$default-padding
        transform:        translateY(-100%)
        padding:          space.$default-padding
        border-radius:    8px
        background-color: $darker-black
        line-height:      2
        font-size:        14px
    
    .shortcut-table
        display: grid
    
    .key
        grid-column:  1
        margin-right: space.$default-padding
        text-align:   center
        font-weight:  600
        color:        $blue

    .command
        grid-column: 2
    
    .space
        grid-column: span 2
    
    .old-chat
        margin-left: 3px
        color:       $blue-grey
</style>
