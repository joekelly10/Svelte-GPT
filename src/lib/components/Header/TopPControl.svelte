<script>
    import { top_p } from '$lib/stores/ai'

    const increment = () => {
        if ($top_p === 1) return $top_p = 0.1
        $top_p = ($top_p * 10 + 1) / 10
    }

    const decrement = () => {
        if ($top_p === 0.1) return $top_p = 1
        $top_p = ($top_p * 10 - 1) / 10
    }
    
    const clicked = (e) => {
        if (e.shiftKey) return decrement()
        increment()
    }
    
    const rightClicked = () => decrement()

    const keydown = (e) => {
        if (e.ctrlKey && e.key === 'p') return increment()
        if (e.ctrlKey && e.shiftKey && e.key === 'P') return decrement()
    }
</script>

<svelte:document on:keydown={keydown} />

<button class='top_p-button' title='Adjust top_p (ctrl+P)' on:click|preventDefault={clicked} on:contextmenu|preventDefault={rightClicked}>
    <div class='icon'>
        <div class='fill' style='height:{$top_p * 100}%'></div>
    </div>
    {$top_p.toFixed(1)}
</button>

<style lang='sass'>
    .top_p-button
        display:         flex
        flex-wrap:       nowrap
        justify-content: center
        align-items:     center
        height:          space.$header-height
        width:           space.$temperature-button-width
        font-size:       14px
        color:           $background-lightest
        cursor:          pointer

        &:hover
            background-color: $background-darkest
            font-weight:      600
            color:            white

            .icon
                margin-left:  1px
                border-color: white

                .fill
                    background-color: white
        
        &:active
            background-color: color.adjust($background-darkest, $lightness: -1%)
            transition:       none

        .icon
            margin-right:  14px
            width:         5px
            height:        18px
            border-radius: 3px
            border:        1px solid $background-lightest

            .fill
                background-color: $background-lightest
</style>
