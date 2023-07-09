<script>
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { chat_id, messages } from '$lib/stores/chat'

    let save_status

    const clickedSave = async () => {
        if ($messages.length === 1) return

        clearTimeout(window.save_status_timer)
        console.log('💾 Saving chat...')
        save_status = 'saving'
        
        const response = await fetch('/api/save', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ id: $chat_id, messages: $messages })
        })

        if (response.ok) {
            const { record } = await response.json()
            $chat_id = record.id
            save_status = 'saved'
            console.log(`💾–✅ Saved chat: ${record.id}`)
            window.save_status_timer = setTimeout(() => { save_status = null }, 2000)
        } else {
            save_status = 'error'
            console.log(`💾–❌ Save failed: ${response.status} ${response.statusText}`)
            const json = await response.json()
            if (json) console.log(json)
        }
    }
</script>

<div class='container'>
    {#if save_status}
        <span class='save-status' out:fade={{ duration: 250, easing: quartOut }}>
            {save_status}
        </span>
    {/if}
    <button class='save-button' on:click={clickedSave}>
        Save
    </button>
</div>

<style lang='sass'>
    .container
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
