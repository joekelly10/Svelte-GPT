<script>
    import { session_id, messages } from '$lib/stores/chat'

    const clickedSave = async () => {
        if ($messages.length === 1) return

        console.log('💾 Saving chat...')

        const filename = `${$session_id}.json`
        const response = await fetch('/api/save', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ messages: $messages, filename })
        })

        if (response.ok) {
            console.log(`💾–✅ saved to ${filename}`)
        }
    }
</script>

<header class='header'>
    <span class='title'>
        Svelte GPT
    </span>
    <button class='save-button' on:click={clickedSave}>
        Save
    </button>
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
    
    .save-button
        position:         absolute
        top:              50%
        right:            space.$default-padding
        transform:        translateY(-50%)
        padding:          12px 24px
        border-radius:    8px
        background-color: $lighter-black
        font-weight:      500
        cursor:           pointer
        
        &:hover
            background-color: darken($lighter-black, 1%)
        
        &:active
            background-color: darken($lighter-black, 2%)
</style>
