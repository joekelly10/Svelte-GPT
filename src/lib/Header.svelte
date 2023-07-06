<script>
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { session_id, messages } from '$lib/stores/chat'

    let filename
    let save_status
    
    $: filename = `${$session_id}.json`

    const clickedSave = async () => {
        if ($messages.length === 1) return

        clearTimeout(window.save_status_timer)
        console.log('💾 Saving chat...')
        save_status = 'saving'
        
        const response = await fetch('/api/save', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ messages: $messages, filename })
        })

        if (response.ok) {
            save_status = 'saved'
            console.log(`💾–✅ Saved to ${filename}`)
            window.save_status_timer = setTimeout(() => { save_status = null }, 3000)
        } else {
            save_status = 'error'
            console.log(`💾–❌ Save failed:`)
            console.log(response)
        }
    }
</script>

<header class='header'>
    <span class='title'>
        Svelte GPT
    </span>
    <div class='save-controls'>
        {#if save_status}
            <span class='save-status' out:fade={{ duration: 166, easing: quartOut }}>
                {save_status}
            </span>
        {/if}
        <button class='save-button' on:click={clickedSave}>
            Save
        </button>
    </div>
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
    
    .save-controls
        position:  absolute
        top:       50%
        right:     space.$default-padding
        transform: translateY(-50%)
    
    .save-status
        margin-right: space.$default-padding
        color:        $blue-grey

    .save-button
        display:          inline-block
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
