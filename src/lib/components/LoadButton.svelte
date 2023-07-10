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

<button class='load-button' title='Open chat (cmd+O)' on:click={clickedLoad}>
    <img class='icon' src='/img/icons/load.svg' alt='Open chat (cmd+O)'>
</button>

<style lang='sass'>
    .load-button
        display: inline-block
        width:   space.$header-height
        height:  space.$header-height
        cursor:  pointer

        &:hover
            background-color: $darkest-black
        
        &:active
            background-color: darken($darkest-black, 1%)

        .icon
            display:        inline-block
            vertical-align: middle
            height:         21px
</style>
