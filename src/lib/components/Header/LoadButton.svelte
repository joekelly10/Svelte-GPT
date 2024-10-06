<script>
    import { loader_active } from '$lib/stores/chat.js'

    const clickedLoad = () => $loader_active = true

    const keydown = (e) => {
        if (e.metaKey && e.key === 'o') {
            e.preventDefault()
            $loader_active = !$loader_active
        }
    }
</script>

<svelte:document on:keydown={keydown} />

<button class='load-button' title='Open chat (⌘+O)' on:click={clickedLoad}>
    Load
</button>

<style lang='sass'>
    .load-button
        display:         flex
        flex-wrap:       nowrap
        justify-content: center
        align-items:     center
        width:           space.$load-save-button-width
        height:          space.$header-height
        font-size:       14px
        color:           $background-lightest
        cursor:          pointer

        &:hover
            background-color: $background-darkest
            font-weight:      600
            color:            white
        
        &:active
            background-color: color.adjust($background-darkest, $lightness: -1%)
</style>
