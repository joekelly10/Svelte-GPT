<script>
    import { temperature } from '$lib/stores/chat'

    let icon

    $: {
        if ($temperature > 1) {
            icon = `temperature-4.svg`
        } else {
            icon = `temperature-${Math.round($temperature / 0.25)}.svg`
        }
    }

    const increment = () => {
        if ($temperature === 1.2) return $temperature = 0
        $temperature = ($temperature * 10 + 1) / 10
    }

    const decrement = () => {
        if ($temperature === 0) return $temperature = 1.2
        $temperature = ($temperature * 10 - 1) / 10
    }
    
    const clicked      = () => decrement()
    const rightClicked = () => increment()

    const keydown = (e) => {
        if (e.ctrlKey && e.key === 't') return decrement()
        if (e.ctrlKey && e.shiftKey && e.key === 'T') return increment()
    }
</script>

<svelte:document on:keydown={keydown} />

<button class='temperature' title='Change temperature (ctrl+T)' on:click|preventDefault={clicked} on:contextmenu|preventDefault={rightClicked}>
    <img class='icon' src='img/icons/{icon}' alt='Change temperature (ctrl+T)'>
    {$temperature.toFixed(1)}
</button>

<style lang='sass'>
    .temperature
        display:         flex
        flex-wrap:       nowrap
        justify-content: center
        align-items:     center
        height:          space.$header-height
        padding:         0 space.$default-padding 0 (space.$default-padding - 4px)
        font-size:       14px
        font-weight:     500
        color:           $lightest-black
        transition:      background-color easing.$quart-out 0.25s
        cursor:          pointer

        &:hover
            color: white

            .icon
                filter: brightness(10)
        
        &:active
            background-color: $darkest-black
            transition:       none

        .icon
            margin-right: 8px
            height:       21px
</style>
