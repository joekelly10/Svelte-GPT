<script>
    import { model } from '$lib/stores/chat'

    const nextModel = () => model.next()
</script>

<button class='model-switcher' on:click={nextModel}>
    <img class='icon' src='img/icons/models/{$model.icon}' alt='ChatGPT 3.5 Turbo'>
    {$model.display_name}
</button>

<style lang='sass'>
    .model-switcher
        position:    absolute
        top:         0
        right:       16px
        height:      space.$header-height
        padding:     0 space.$default-padding
        line-height: space.$header-height
        font-size:   14px
        cursor:      pointer

        &:hover
            background-color: $darkest-black
        
        &:active
            background-color: darken($darkest-black, 1%)

    .icon
        display:        inline-block
        vertical-align: middle
        margin-top:     -4px
        margin-right:   12px
        height:         21px
</style>
