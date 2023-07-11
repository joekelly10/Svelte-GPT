<script>
    import { model } from '$lib/stores/chat'

    const nextModel = () => model.next()

    const keydown = (e) => {
        if (e.metaKey && e.key === 'm') {
            e.preventDefault()
            nextModel()
        }
    }
</script>

<svelte:document on:keydown={keydown} />

<button class='model-switcher' title='Switch model (cmd+M)' on:click={nextModel}>
    <img class='icon' src='img/icons/models/{$model.icon}' alt='ChatGPT 3.5 Turbo'>
    {$model.display_name}
</button>

<style lang='sass'>
    .model-switcher
        display:     flex
        flex-wrap:   nowrap
        align-items: center
        position:    absolute
        top:         0
        right:       16px
        height:      space.$header-height
        padding:     0 space.$default-padding
        font-size:   14px
        font-weight: 500
        cursor:      pointer

        &:hover
            background-color: $darkest-black
        
        &:active
            background-color: darken($darkest-black, 1%)

    .icon
        margin-right: 16px
        height:       21px
</style>
