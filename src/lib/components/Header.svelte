<script>
    import SaveButton from '$lib/components/SaveButton.svelte'
    import LoadButton from '$lib/components/LoadButton.svelte'
</script>

<header class='header'>
    <LoadButton/>
    <span class='title'>
        Svelte GPT
    </span>
    <SaveButton/>
</header>

<style lang='sass'>
    .header
        flex-grow:        0
        position:         relative
        height:           space.$header-height
        box-sizing:       border-box
        background-color: $darker-black
        text-align:       center
    
    .title
        font-weight: 500
        line-height: space.$header-height
</style>
