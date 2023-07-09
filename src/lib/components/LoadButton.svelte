<script>
    import { loader_active } from '$lib/stores/chat.js'

    const clickedLoad = () => $loader_active = true

    const keydown = (e) => {
        if (e.metaKey && e.key === 'l') {
            e.preventDefault()
            $loader_active = !$loader_active
        }
    }
</script>

<svelte:document on:keydown={keydown} />

<button class='load-button' on:click={clickedLoad}>
    Load
</button>

<style lang='sass'>
    .load-button
        display:          inline-block
        position:         absolute
        top:              50%
        left:             space.$default-padding
        transform:        translateY(-50%)
        padding:          12px 24px
        border-radius:    8px
        background-color: darken($darker-black, 3%)
        font-weight:      500
        cursor:           pointer
        
        &:hover
            background-color: darken($darker-black, 4%)
        
        &:active
            background-color: darken($darker-black, 5%)
</style>
