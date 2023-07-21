<script>
    import SaveButton from '$lib/components/SaveButton.svelte'
    import LoadButton from '$lib/components/LoadButton.svelte'
    import TopPControl from '$lib/components/TopPControl.svelte'
    import TemperatureControl from '$lib/components/TemperatureControl.svelte'
    import ModelSwitcher from '$lib/components/ModelSwitcher.svelte'

    let save_button

    export const save = () => save_button.save()
</script>

<header class='header'>
    <div class='load-and-save'>
        <LoadButton/>
        <SaveButton bind:this={save_button} />
    </div>
    <span class='title'>
        Svelte GPT
    </span>
    <div class='model'>
        <TopPControl/>
        <TemperatureControl/>
        <ModelSwitcher/>
    </div>
</header>

<style lang='sass'>
    .header
        flex-grow:        0
        position:         relative
        height:           space.$header-height
        box-sizing:       border-box
        background-color: $background-darker
        text-align:       center
    
    .load-and-save
        display:      flex
        position:     absolute
        top:          0
        left:         0
        height:       space.$header-height
        padding-left: 16px
        text-align:   left
    
    .title
        font-weight: 500
        line-height: space.$header-height
    
    .model
        display:       flex
        position:      absolute
        top:           0
        right:         0
        height:        space.$header-height
        padding-right: 16px
        text-align:    right
</style>
