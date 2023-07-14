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

<button class='save-button' class:saving={save_status === 'saving'} title='Save chat (cmd+S)' on:click={save}>
    <svg class='icon' xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' id='save'><path fill='none' d='M0 0h24v24H0V0z'></path><path d='M19 13v5c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-5c0-.55-.45-1-1-1s-1 .45-1 1v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6c0-.55-.45-1-1-1s-1 .45-1 1zm-6-.33l1.88-1.88c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-3.59 3.59c-.39.39-1.02.39-1.41 0L7.7 12.2c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0L11 12.67V4c0-.55.45-1 1-1s1 .45 1 1v8.67z'></path></svg>
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

        &.saving
            .icon
                fill: $blue-grey
        
        &:hover
            background-color: $darkest-black
        
        &:active
            background-color: darken($darkest-black, 1%)
        
        .icon
            height: 21px
            fill:   white
    
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
