<script>
    import { page } from '$app/stores'
    import { model } from '$lib/stores/chat'
    import { onMount } from 'svelte'

    onMount(() => getModelFromURL())
    
    const getModelFromURL = () => {
        if ($page.url.searchParams.has('model')) {
            model.setById($page.url.searchParams.get('model'))
            $page.url.searchParams.delete('model')
            window.history.replaceState(null, '', $page.url.toString())
        }
    }

    const keydown = (e) => {
        if (e.shiftKey && e.metaKey && e.key === 'm') {
            e.preventDefault()
            model.prev()
            return
        }
        if (e.metaKey && e.key === 'm') {
            e.preventDefault()
            model.next()
        }
    }

    const clicked = () => model.next()

    const rightClicked = (e) => {
        e.preventDefault()
        model.prev()
        return false
    }
</script>

<svelte:document on:keydown={keydown} />

<button 
    class='model-switcher'
    title='Switch model (⌘+M)'
    on:click={clicked}
    on:contextmenu={rightClicked}
>
    <img class='icon' src='img/icons/models/{$model.icon}' alt='{$model.name}'>
    {$model.name}
</button>

<style lang='sass'>
    .model-switcher
        display:     flex
        flex-wrap:   nowrap
        align-items: center
        height:      space.$header-height
        padding:     0 space.$default-padding
        font-size:   14px
        font-weight: 600
        cursor:      pointer

        &:hover
            background-color: $background-darkest
        
        &:active
            background-color: darken($background-darkest, 1%)

    .icon
        margin-right: 16px
        height:       21px
</style>
