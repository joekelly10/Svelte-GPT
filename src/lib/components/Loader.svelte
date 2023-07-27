<script>
    import hljs from 'highlight.js'
    import { marked } from 'marked'
    import { chat_id, messages, forks, active_fork, token_count, loader_active, loader_page } from '$lib/stores/chat.js'
    import { onMount, onDestroy, tick, createEventDispatcher } from 'svelte'
    import { scale } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { formatDate, addCopyButtons, messageCount } from '$lib/utils/helpers'

    marked.use({ mangle: false, headerIds: false })
    
    const dispatch = createEventDispatcher()
    
    let chats          = []
    let keyboard_index = null
    let total_chats    = 0
    let total_pages    = 0

    const close = () => $loader_active = false

    const keydown = (e) => {
        e.preventDefault()
        if (e.key === 'Escape') return close()
        if (e.key === 'ArrowUp') return prevItem()
        if (e.key === 'ArrowDown') return nextItem()
        if (e.key === 'ArrowLeft') return prevPage()
        if (e.key === 'ArrowRight') return nextPage()
        if (e.key === 'Enter') return keyboardSelect()
        if (e.metaKey && e.key === 'Backspace') return deleteChat()
    }

    const fetchChats = async () => {
        console.log('📂 Fetching chats...')

        chats = []

        const response = await fetch(`/api/chats?page=${$loader_page}&per_page=10`, {
            method:  'GET',
            headers: { 'Content-Type': 'application/json' }
        })

        if (response.ok) {
            const json = await response.json()

            chats       = json.items
            total_chats = json.totalItems
            total_pages = json.totalPages

            await tick()
            hljs.highlightAll()
            console.log(`📂–✅ Fetched ${json.items.length} items.`)
        } else {
            console.log(`📂–❌ Fetch chats failed: ${response.status} ${response.statusText}`)
            const json = await response.json()
            if (json) console.log(json)
        }
    }

    const nextPage = async () => {
        if (!($loader_page < total_pages)) return
        $loader_page += 1

        await fetchChats()
        keyboard_index = null
    }

    const prevPage = async () => {
        if ($loader_page === 1) return
        $loader_page -= 1

        await fetchChats()
        keyboard_index = null
    }

    const prevItem = async () => {
        if (keyboard_index === 0) return

        if (keyboard_index === null) {
            keyboard_index = 0
        } else {
            keyboard_index -= 1
        }

        await tick()
        scrollIntoView()
    }

    const nextItem = async () => {
        if (keyboard_index === chats.length - 1) return

        if (keyboard_index === null) {
            keyboard_index = 0
        } else {
            keyboard_index += 1
        }

        await tick()
        scrollIntoView()
    }

    const scrollIntoView = () => {
        const highlighted = document.querySelector('.keyboard-highlight')
        highlighted.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    const keyboardSelect = async () => {
        if (keyboard_index === null && chats.length) {
            keyboard_index = 0
            await tick()
        }
        const highlighted = document.querySelector('.keyboard-highlight')
        highlighted.classList.add('selected')
        setTimeout(() => { loadChat(chats[keyboard_index]) }, 50)
    }

    const loadChat = async (chat) => {
        $messages    = chat.messages
        $forks       = chat.forks
        $active_fork = chat.active_fork
        $chat_id     = chat.id

        await tick()

        hljs.highlightAll()
        addCopyButtons()
        close()
    
        dispatch('chatLoaded')
    }

    const deleteChat = async () => {
        const chat        = chats[keyboard_index]
        const highlighted = document.querySelector('.keyboard-highlight')
        
        highlighted.classList.add('selected')

        if (confirm('Delete selected chat?  Press OK to confirm.')) {
            console.log(`🗑️ Deleting chat: ${chat.id}...`)
            const response = await fetch(`/api/chats/${chat.id}`, {
                method:  'DELETE',
                headers: { 'Content-Type': 'application/json' }
            })

            if (response.ok) {
                console.log(`🗑️–✅ Chat deleted.`)

                if (chat.id === $chat_id) {
                    $messages    = $messages.slice(0,1)
                    $forks       = [{ message_ids: [0], forked_at: [], provisional: false }]
                    $active_fork = 0
                    $chat_id     = null
                    $token_count = 0
                }
                
                await fetchChats()
                
                if (!chats.length) keyboard_index = null
                if (keyboard_index > chats.length - 1) keyboard_index = chats.length - 1

                await tick()

                const highlighted = document.querySelector('.keyboard-highlight')
                highlighted.scrollIntoView({ behavior: 'smooth', block: 'center' })
            } else {
                console.log(`🗑️–❌ Delete failed: ${response.status} ${response.statusText}`)
                const json = await response.json()
                if (json) console.log(json)
            }
        }
    }

    onMount(() => {
        document.addEventListener('keydown', keydown)
        fetchChats()
    })

    onDestroy(() => {
        document.removeEventListener('keydown', keydown)
    })
</script>

<div class='loader' in:scale={{ start: 1.02, opacity: 0, duration: 200, easing: quartOut }} out:scale={{ start: 1.02, opacity: 0, duration: 100, easing: quartOut }}>
    <div class='inner'>
        <div class='total-chats'>
            {total_chats} {total_chats === 1 ? 'item' : 'items'} total
        </div>

        <div class='page-controls'>
            <button class='prev-page-button' class:disabled={$loader_page === 1} on:click={prevPage}>
                Prev
            </button>
            <span class='current-page'>
                {$loader_page} / {total_pages}
            </span>
            <button class='next-page-button' class:disabled={!($loader_page < total_pages)} on:click={nextPage}>
                Next
            </button>
        </div>

        <button class='close-button' on:click={close}>
            Close
        </button>

        <div class='chats'>
            {#each chats as chat, i}
                <button class='chat' class:keyboard-highlight={i === keyboard_index} on:click={loadChat(chat)}>
                    <div class='date'>
                        {@html formatDate(chat.updated)}
                        {#if chat.id === $chat_id}
                            <span class='active'>
                                (active now)
                            </span>
                        {/if}
                    </div>

                    <div class='message'>
                        <div class='author-container'>
                            <strong class='author-name'>
                                You
                            </strong>
                        </div>

                        {@html marked(chat.messages[1].content)}
                    </div>

                    <div class='message-count'>
                        <span class='message-count'>
                            {messageCount(chat.messages)} {messageCount(chat.messages) === 1 ? 'message' : 'messages'}
                        </span>
                        {#if chat.forks.length > 1}
                            <span class='fork-count'>
                                <span class='bull'>&bull;</span>
                                {chat.forks.length} forks
                            </span>
                        {/if}
                        {#if chat.messages.find(m => m.model === 'gpt-4')}
                            <strong class='gpt-4-badge'>
                                GPT-4
                            </strong>
                        {/if}
                    </div>
                </button>
            {/each}
        </div>
    </div>
</div>

<style lang='sass'>
    .loader
        position:         fixed
        top:              0
        left:             0
        z-index:          99
        width:            100vw
        height:           100vh
        background-color: transparentize($background-darker, 0.175)
    
    .inner
        position:       relative
        height:         100%
        box-sizing:     border-box
        padding-bottom: 128px
        overflow-y:     scroll
        +shared.scrollbar
    
    .total-chats
        position:    absolute
        top:         0
        left:        0
        padding:     24px space.$default-padding
        font-weight: 500
    
    .close-button
        position:    fixed
        top:         0
        right:       0
        padding:     24px space.$default-padding
        font-weight: 500
        cursor:      pointer

        &:hover
            color: $pale-blue
    
    .page-controls
        text-align:  center
        font-weight: 500
    
    .prev-page-button,
    .next-page-button
        padding:     24px space.$default-padding
        font-weight: 500
        cursor:      pointer

        &.disabled  
            color:          $mid-grey
            cursor:         default
            pointer-events: none
    
    .chats
        margin: 0 auto
        width:  800px
    
    .chat
        margin-bottom:    space.$default-padding
        width:            100%
        box-sizing:       border-box
        padding:          space.$default-padding
        border-radius:    8px
        border:           1px solid $background-lighter
        background-color: $background-lighter
        text-align:       left
        cursor:           pointer
        transition:       border easing.$quart-out 0.125s
        +shared.code_block_styles

        &:hover
            border:     1px solid $blue-grey
            transition: none
        
        &:active
            background-color: darken($background-lighter, 2%)
        
        &.keyboard-highlight
            box-shadow: 0 0 0 2px $blue

        .date
            margin-bottom: space.$default-padding
            font-weight:   500
            color:         $yellow
            
            :global(.bull)
                margin:      0 3px
                font-weight: 700
            
            .active
                margin-left: 8px
                color:       $pale-blue

        .message
            $container-width: 64px
            position:     relative
            padding-left: $container-width

            .author-container
                position:   absolute
                top:        0
                left:       0
                width:      $container-width
                text-align: left

            .author-name
                display:          inline-block
                position:         relative
                top:              1px
                padding:          0 5px
                border-radius:    5px
                line-height:      24px
                font-size:        14px
                font-weight:      600
                background-color: $blue
                color:            $background-darker
        
        .message-count
            margin-top: space.$default-padding
            text-align: right
            color:      $blue-grey

        .fork-count
            .bull
                margin: 0 5px

        .gpt-4-badge
            display:          inline-block
            vertical-align:   middle
            margin-top:       -1px
            margin-left:      space.$default-padding
            padding:          0 5px
            border-radius:    4px
            background-color: $gpt4-purple
            border-radius:    5px
            line-height:      24px
            font-size:        14px
            font-weight:      600
            color:            white
    
    :global(.chat.keyboard-highlight.selected)
        background-color: darken($background-lighter, 2%)
</style>
