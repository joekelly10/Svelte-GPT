<script>
    import SaveControls from '$lib/SaveControls.svelte'
</script>

<header class='header'>
    <span class='title'>
        Svelte GPT
    </span>
    <SaveControls/>
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
