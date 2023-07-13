<script>
    import { page } from '$app/stores'
    import { model, expand_context_window } from '$lib/stores/chat'
    import { onMount } from 'svelte'

    onMount(() => getModelFromURL())
    
    const getModelFromURL = () => {
        if ($page.url.searchParams.has('model')) {
            model.setByName($page.url.searchParams.get('model'))
        }
    }

    const keydown = (e) => {
        if (e.metaKey && e.key === 'm') {
            e.preventDefault()
            nextModel()
        }
    }

    const nextModel = () => model.next()
</script>

<svelte:document on:keydown={keydown} />

<button class='model-switcher' title='Switch model (cmd+M)' on:click={nextModel}>
    <img class='icon' src='img/icons/models/{$model.icon}' alt='ChatGPT 3.5 Turbo'>
    {#if $expand_context_window}
        {$model.expanded.display_name}<span class='expanded-icon'>⇪</span>
    {:else}
        {$model.display_name}
    {/if}
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
    
    .expanded-icon
        margin-left: 16px
        color:       $openai-green
</style>
