<script>
    let message

    function keyupMessageInput(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            // send message
        }
    }
</script>

<svelte:head>
    <title>GPT API</title>
</svelte:head>

<footer>
    <div class='input-container'>
        <div
            class='input'
            contenteditable='true'
            bind:innerHTML={message}
            on:keyup={keyupMessageInput}
        ></div>
    </div>
</footer>

<style lang='sass'>
    +shared.globals

    footer
        position:   fixed
        bottom:     0
        left:       0
        width:      100%
        box-sizing: border-box
        padding:    space.$default-padding
        text-align: center
        color:      $blue

    .input-container
        margin:           0 auto
        width:            720px
        box-sizing:       border-box
        padding:          16px
        border:           1px solid $mid-grey
        border-radius:    12px
        background-color: lighten($off-black, 3%)

    
    .input
        position:      relative
        z-index:       1
        margin:        0 auto
        width:         100%
        max-height:    192px
        box-sizing:    border-box
        padding-right: 16px
        line-height:   24px
        text-align:    left
        font-family:   font.$sans-serif
        font-size:     16px
        font-weight:   400
        color:         white
        resize:        none
        overflow:      overlay

        &::-webkit-scrollbar
            width:      8px
            background: transparent
        
        &::-webkit-scrollbar-thumb
            background:    white
            border-radius: 99px
</style>
