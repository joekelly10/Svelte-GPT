<script>
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { chat_id, messages } from '$lib/stores/chat'

    let save_status

    export const save = async () => {
        if ($messages.length === 1) return

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
            console.log(`💾–✅ Saved chat: ${record.id}`)
            window.save_status_timer = setTimeout(() => { save_status = null }, 2500)
            setTimeout(() => { save_status = 'saved' }, 500)
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
            save()
        }
    }
</script>

<svelte:document on:keydown={keydown} />

<button class='save-button' title='Save chat (cmd+S)' on:click={save}>
    <img class='icon' src='/img/icons/save.svg' alt='Save chat (cmd+S)'>
</button>

{#if save_status}
    <div class='save-status' in:fade={{ duration: 150, easing: quartOut }} out:fade={{ duration: 250, easing: quartOut }}>
        {#if save_status === 'saving'}
            <img class='spinner' src='/img/icons/cog.png' alt='Saving'>
        {:else if save_status === 'saved'}
            Saved
        {/if}
    </div>
{/if}

<style lang='sass'>
    .save-button
        display:         flex
        flex-wrap:       nowrap
        justify-content: center
        align-items:     center
        height:          space.$header-height
        padding:         0 space.$default-padding
        cursor:          pointer
        
        &:hover
            background-color: $darkest-black
        
        &:active
            background-color: darken($darkest-black, 1%)
        
        .icon
            height: 21px
    
    .save-status
        display:         flex
        flex-wrap:       nowrap
        justify-content: center
        align-items:     center
        margin-left:     20px
        height:          space.$header-height
        font-size:       14px
        font-weight:     500
        color:           $blue-grey
    
    .spinner
        height:    16px
        animation: animation.$spinner-animation
</style>
