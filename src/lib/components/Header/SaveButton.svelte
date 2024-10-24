<script>
    import { chat_id, messages, forks, active_fork } from '$lib/stores/chat'

    let timer
    let status = 'idle'

    export const save = async () => {
        if ($messages.length === 1 || status !== 'idle') return

        clearTimeout(timer)

        console.log('💾 Saving chat...')
        status = 'saving'
        
        const response = await fetch('/api/chats/save', {
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
            setTimeout(() => { status = 'saved' }, 500)
            timer = setTimeout(() => { status = 'idle' }, 2500)
        } else {
            status = 'idle'
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

<button class='save-button {status}' title='Save chat (⌘+S)' on:click={save}>
    <span class='save-text'>
        Save
    </span>
    <div class='spinner'>
        <img class='spinner-img' src='/img/icons/cog.png' alt='Saving'>
    </div>
    <span class='saved-text'>
        Saved
    </span>
</button>

<style lang='sass'>
    .save-button
        display:         flex
        flex-wrap:       nowrap
        justify-content: center
        align-items:     center
        position:        relative
        width:           space.$load-save-button-width
        height:          space.$header-height
        font-size:       14px
        color:           $background-lightest
        cursor:          pointer
        
        &:hover
            background-color: $background-darkest

            .save-text
                font-weight: 600
                color:       white
        
        &:active
            background-color: color.adjust($background-darkest, $lightness: -1%)

        &.saving
            .save-text
                opacity:    0
                transition: none

            .spinner
                opacity: 1

                .spinner-img
                    animation: animation.$spinner-animation

        &.saved
            .save-text
                opacity:    0
                transition: none
            
            .saved-text
                opacity: 1

    .save-text
        opacity:    1
        transition: opacity easing.$quart-out 0.125s 0.125s

    .spinner
        position:  absolute
        top:       50%
        left:      50%
        transform: translateX(-50%) translateY(-9px)
        opacity:   0

        .spinner-img
            height: 19px
    
    .saved-text
        position:    absolute
        top:         50%
        left:        50%
        transform:   translateX(-50%) translateY(-50%)
        color:       $blue-grey
        font-weight: 600
        opacity:     0
        transition:  opacity easing.$quart-out 0.125s
</style>
