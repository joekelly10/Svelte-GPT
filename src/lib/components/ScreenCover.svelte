<div class='screen-cover'>
    <img class='icon no-mobile-icon' src='/img/icons/no-mobile-white.png' alt='No mobile'>
    <div class='message'>
        Embiggen thy screen, human.
    </div>
</div>

<style lang='sass'>
    .screen-cover
        display:          flex
        flex-direction:   column
        align-items:      center
        justify-content:  center
        position:         fixed
        top:              0
        left:             0
        z-index:          9999
        width:            100vw
        height:           100vh
        background-color: color.adjust($background-darkest, $alpha: -0.125)
        transform:        scale(1.02)
        filter:           none
        opacity:          1
        pointer-events:   auto
        transition:       transform easing.$quart-out 0.2s, filter easing.$quart-out 0.2s, opacity easing.$quart-out 0.2s

    .icon
        margin-bottom: space.$default-padding
        height:        72px

    @media (min-width: breakpoint.$cover-at-width) and (min-height: breakpoint.$cover-at-height)
        .screen-cover
            transform:      none
            filter:         blur(4px)
            opacity:        0
            pointer-events: none
            transition:     transform easing.$quart-out 0.1s, filter easing.$quart-out 0.1s, opacity easing.$quart-out 0.1s
</style>
