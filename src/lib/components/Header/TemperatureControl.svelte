<script>
    import { temperature } from '$lib/stores/ai'

    let icon_class

    $: {
        if ($temperature > 1) {
            icon_class = `show-icon-4`
        } else {
            icon_class = `show-icon-${Math.round($temperature / 0.25)}`
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
    
    const clicked = (e) => {
        if (e.shiftKey) return decrement()
        increment()
    }

    const rightClicked = () => decrement()

    const keydown = (e) => {
        if (e.ctrlKey && e.key === 't') return increment()
        if (e.ctrlKey && e.shiftKey && e.key === 'T') return decrement()
    }
</script>

<svelte:document on:keydown={keydown} />

<button class='temperature {icon_class}' title='Adjust temperature (ctrl+T)' on:click|preventDefault={clicked} on:contextmenu|preventDefault={rightClicked}>
    <svg class='icon icon-0' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' id='temperature-0'><path d='M12,15a2,2,0,1,0,2,2A2,2,0,0,0,12,15Zm4.5-2V5.5a4.5,4.5,0,0,0-9,0V13a6,6,0,0,0,3.21,9.83A7,7,0,0,0,12,23,6,6,0,0,0,16.5,13Zm-2,7.07a4,4,0,0,1-5.32-6,1,1,0,0,0,.3-.71V5.5a2.5,2.5,0,0,1,5,0v7.94a1,1,0,0,0,.3.71,4,4,0,0,1-.28,6Z'></path></svg>
    <svg class='icon icon-1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' id='temperature-1'><path d='M16.5,13V5.5a4.5,4.5,0,0,0-9,0V13a6,6,0,0,0,3.21,9.83A7,7,0,0,0,12,23,6,6,0,0,0,16.5,13Zm-2,7.07a4,4,0,0,1-5.32-6,1,1,0,0,0,.3-.71V5.5a2.5,2.5,0,0,1,5,0v7.94a1,1,0,0,0,.3.71,4,4,0,0,1-.28,6ZM13,15.28V12.5a1,1,0,0,0-2,0v2.78A2,2,0,0,0,10,17a2,2,0,0,0,4,0A2,2,0,0,0,13,15.28Z'></path></svg>
    <svg class='icon icon-2' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' id='temperature-2'><path d='M13,15.28V10.5a1,1,0,0,0-2,0v4.78A2,2,0,0,0,10,17a2,2,0,0,0,4,0A2,2,0,0,0,13,15.28ZM16.5,13V5.5a4.5,4.5,0,0,0-9,0V13a6,6,0,0,0,3.21,9.83A7,7,0,0,0,12,23,6,6,0,0,0,16.5,13Zm-2,7.07a4,4,0,0,1-5.32-6,1,1,0,0,0,.3-.71V5.5a2.5,2.5,0,0,1,5,0v7.94a1,1,0,0,0,.3.71,4,4,0,0,1-.28,6Z'></path></svg>
    <svg class='icon icon-3' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' id='temperature-3'><path d='M13,15.28V8.5a1,1,0,0,0-2,0v6.78A2,2,0,0,0,10,17a2,2,0,0,0,4,0A2,2,0,0,0,13,15.28ZM16.5,13V5.5a4.5,4.5,0,0,0-9,0V13a6,6,0,0,0,3.21,9.83A7,7,0,0,0,12,23,6,6,0,0,0,16.5,13Zm-2,7.07a4,4,0,0,1-5.32-6,1,1,0,0,0,.3-.71V5.5a2.5,2.5,0,0,1,5,0v7.94a1,1,0,0,0,.3.71,4,4,0,0,1-.28,6Z'></path></svg>
    <svg class='icon icon-4' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' id='temperature-4'><path d='M13,15.28V5.5a1,1,0,0,0-2,0v9.78A2,2,0,0,0,10,17a2,2,0,0,0,4,0A2,2,0,0,0,13,15.28ZM16.5,13V5.5a4.5,4.5,0,0,0-9,0V13a6,6,0,0,0,3.21,9.83A7,7,0,0,0,12,23,6,6,0,0,0,16.5,13Zm-2,7.07a4,4,0,0,1-6.42-2.2,4,4,0,0,1,1.1-3.76,1,1,0,0,0,.3-.71V5.5a2.5,2.5,0,0,1,5,0v7.94a1,1,0,0,0,.3.71,4,4,0,0,1-.28,6Z'></path></svg>
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
        color:           $background-lightest
        transition:      background-color easing.$quart-out 0.25s
        cursor:          pointer

        &.show-icon-0
            .icon-0
                display: block
        &.show-icon-1
            .icon-1
                display: block
        &.show-icon-2
            .icon-2
                display: block
        &.show-icon-3
            .icon-3
                display: block
        &.show-icon-4
            .icon-4
                display: block

        &:hover
            color: white

            .icon
                fill: white
        
        &:active
            background-color: $background-darkest
            transition:       none

        .icon
            display:      none
            margin-right: 12px
            height:       21px
            fill:         $background-lightest
</style>
