<script>
    import { page } from '$app/stores'
    import { model, expand_context_window } from '$lib/stores/chat'
    import { onMount } from 'svelte'

    onMount(() => getModelFromURL())
    
    const getModelFromURL = () => {
        if ($page.url.searchParams.has('model')) {
            model.setById($page.url.searchParams.get('model'))
        }
    }

    const removeModelFromURL = () => {
        $page.url.searchParams.delete('model')
        window.history.replaceState(null, '', $page.url.toString())
    }

    const keydown = (e) => {
        if (e.metaKey && e.key === 'm') {
            e.preventDefault()
            nextModel()
        }
    }

    const nextModel = () => {
        model.next()
        removeModelFromURL()
    }
</script>

<svelte:document on:keydown={keydown} />

<button class='model-switcher' title='Switch model (⌘+M)' on:click={nextModel}>
    <img class='icon' src='img/icons/models/{$model.icon}' alt='ChatGPT 3.5 Turbo'>
    {#if $expand_context_window}
        {$model.expanded.name}<span class='expanded-icon'>⇪</span>
    {:else}
        {$model.name}
    {/if}
</button>

<style lang='sass'>
    .model-switcher
        display:     flex
        flex-wrap:   nowrap
        align-items: center
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
    
    .expanded-icon
        margin-left: 16px
        color:       $openai-green
</style>
