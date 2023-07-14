<script>
    import { top_p } from '$lib/stores/chat'

    const increment = () => {
        if ($top_p === 1) return $top_p = 0.1
        $top_p = ($top_p * 10 + 1) / 10
    }

    const decrement = () => {
        if ($top_p === 0.1) return $top_p = 1
        $top_p = ($top_p * 10 - 1) / 10
    }
    
    const clicked      = () => decrement()
    const rightClicked = () => increment()

    const keydown = (e) => {
        if (e.ctrlKey && e.key === 'p') return decrement()
        if (e.ctrlKey && e.shiftKey && e.key === 'P') return increment()
    }
</script>

<svelte:document on:keydown={keydown} />

<button class='top_p-button' title='Change top_p (ctrl+alt+T)' on:click|preventDefault={clicked} on:contextmenu|preventDefault={rightClicked}>
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
        padding:         0 space.$default-padding
        font-size:       14px
        font-weight:     500
        color:           $lightest-black
        transition:      background-color easing.$quart-out 0.25s
        cursor:          pointer

        &:hover
            color: white

            .icon
                border-color: white

                .fill
                    background-color: white
        
        &:active
            background-color: $darkest-black
            transition:       none

        .icon
            margin-right:  14px
            width:         4px
            height:        19px
            border-radius: 2px
            border:        1px solid $lightest-black

            .fill
                background-color: $lightest-black
</style>
