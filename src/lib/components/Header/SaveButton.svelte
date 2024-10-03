<script>
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { chat_id, messages, forks, active_fork } from '$lib/stores/chat'

    let save_status

    export const save = async () => {
        if ($messages.length === 1) return

        console.log('💾 Saving chat...')
        save_status = 'saving'
        
        const response = await fetch('/api/save', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                id:          $chat_id,
                messages:    $messages,
                forks:       $forks,
                active_fork: $active_fork
            })
        })

        if (response.ok) {
            const { record } = await response.json()
            $chat_id = record.id
            console.log(`💾–✅ Saved chat: ${record.id}`)
            setTimeout(() => { save_status = 'saved' }, 500)
            window.save_status_timer = setTimeout(() => { save_status = null }, 2500)
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

<button class='save-button' class:saving={save_status === 'saving'} title='Save chat (⌘+S)' on:click={save}>
    {#if save_status === 'saving'}
        <img class='spinner' src='/img/icons/cog.png' alt='Saving'>
    {:else}
        <svg class='icon' width='64' height='64' viewBox='0 0 64 64'>
            <g transform='matrix(1 0 0 1 31.5 32.240688936)'>
                <g transform='matrix(1 0 0 1 0 21.740688936)'>
                    <path transform=' translate(-50, -72)' d='M 19 70 C 19 76.62741699796952 24.372583002030478 82 31 82 L 69 82 C 75.62741699796952 82 81 76.62741699796952 81 70 L 81 66 C 81 63.79086100067683 79.20913899932317 62 77 62 C 74.79086100067683 62 73 63.79086100067683 73 66 L 73 70 C 73 72.20913899932317 71.20913899932317 74 69 74 L 31 74 C 28.790861000676827 74 27 72.20913899932317 27 70 L 27 66 C 27 63.79086100067683 25.209138999323173 62 23 62 C 20.790861000676827 62 19 63.79086100067683 19 66 Z'/>
                </g>
                <g transform='matrix(1 0 0 1 0 -9.2324123993)'>
                    <path transform=' translate(-50.01, -40.5082264656)' d='M 50 18 L 50 18 C 47.79086100067683 18 46 19.790861000676827 46 22 L 46 51.34 L 40 45.34 C 38.62027502302031 43.89435990275619 36.40756022201976 43.63404051440319 34.730000000000004 44.720000000000006 C 33.754060217736246 45.395334513130194 33.128405733927465 46.469179666865415 33.022175442885455 47.65123308718742 C 32.915945151843445 48.83328650750943 33.34010940373038 50.001478116249984 34.18000000000001 50.84 L 43.82000000000001 60.46 C 47.23886471560617 63.86867066978415 52.771135284393836 63.86867066978415 56.190000000000005 60.46 L 65.84 50.84 C 66.67989059626963 50.001478116249984 67.10405484815657 48.83328650750943 66.99782455711455 47.65123308718742 C 66.89159426607254 46.469179666865415 66.26593978226377 45.395334513130194 65.29 44.720000000000006 C 63.61243977798025 43.63404051440319 61.3997249769797 43.89435990275619 60.02000000000001 45.34 L 54.02000000000001 51.34 L 54.02000000000001 22 C 54.02001330433721 20.935659709227778 53.5958416227212 19.91520134668536 52.841364917999734 19.16447825741027 C 52.086888213278264 18.41375516813518 51.06432698651817 17.994678298462567 50 18 Z'/>
                </g>
            </g>
        </svg>
    {/if}
</button>

{#if save_status}
    <div class='save-status' in:fade={{ duration: 100, easing: quartOut }} out:fade={{ delay: 500, duration: 250, easing: quartOut }}>
        {#if save_status === 'saving'}
            Saving
        {:else}
            Saved
        {/if}
    </div>
{/if}

<style lang='sass'>
    $icon-size: 17px

    .save-button
        display:         flex
        flex-wrap:       nowrap
        justify-content: center
        align-items:     center
        height:          space.$header-height
        width:           $icon-size + 2 * space.$default-padding
        cursor:          pointer

        &.saving
            .icon
                fill: $blue-grey
        
        &:hover
            background-color: $background-darkest
        
        &:active
            background-color: darken($background-darkest, 1%)
        
        .icon
            height: $icon-size
            fill:   white
    
    .save-status
        display:         flex
        flex-wrap:       nowrap
        justify-content: center
        align-items:     center
        margin-left:     20px
        height:          space.$header-height
        font-size:       14px
        color:           $blue-grey
    
    .spinner
        position:  relative
        top:       1px
        height:    19px
        animation: animation.$spinner-animation
</style>
