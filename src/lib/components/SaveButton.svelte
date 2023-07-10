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

    const keydown = (e) => {
        if (e.metaKey && e.key === 's') {
            e.preventDefault()
            clickedSave()
        }
    }
</script>

<svelte:document on:keydown={keydown} />

<button class='save-button' title='Save chat (cmd+S)' on:click={clickedSave}>
    <img class='icon' src='/img/icons/save.svg' alt='Save chat (cmd+S)'>
</button>

{#if save_status}
    <span class='save-status' out:fade={{ duration: 250, easing: quartOut }}>
        {save_status}
    </span>
{/if}

<style lang='sass'>
    .save-button
        display: inline-block
        width:   space.$header-height
        height:  space.$header-height
        cursor:  pointer
        
        &:hover
            background-color: $darkest-black
        
        &:active
            background-color: darken($darkest-black, 1%)
        
        .icon
            display:        inline-block
            vertical-align: middle
            height:         21px
    
    .save-status
        margin-left: 24px
        line-height: space.$header-height
        color:       $blue-grey
</style>
