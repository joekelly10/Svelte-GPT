<script>
    import SaveButton from '$lib/components/SaveButton.svelte'
    import LoadButton from '$lib/components/LoadButton.svelte'
</script>

<header class='header'>
    <div class='load-and-save'>
        <LoadButton/>
        <SaveButton/>
    </div>
    <span class='title'>
        Svelte GPT
    </span>
</header>

<style lang='sass'>
    .header
        flex-grow:        0
        position:         relative
        height:           space.$header-height
        box-sizing:       border-box
        background-color: $darker-black
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
</style>
