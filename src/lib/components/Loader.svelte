<script>
    import hljs from 'highlight.js'
    import { marked } from 'marked'
    import { chat_id, messages, forks, active_fork, token_count, loader_active } from '$lib/stores/chat.js'
    import { onMount, onDestroy, tick, createEventDispatcher } from 'svelte'
    import { scale, fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { formatDate, addCopyButtons } from '$lib/utils/helpers'

    marked.use({ mangle: false, headerIds: false })
    
    const dispatch = createEventDispatcher()
    
    let chats          = [],
        keyboard_index = null,
        total_chats    = 0,
        total_pages    = 0,
        active_page    = 1

    let search_input,
        search_value,
        searched_value,
        search_timer

    const close = () => $loader_active = false

    $: searchValueChanged(search_value)

    const searchValueChanged = (_) => {
        clearTimeout(search_timer)
        search_timer = setTimeout(() => {
            active_page = 1
            fetchChats()
        }, 250)
    }

    const keydown = (e) => {
        if (e.key === 'Escape') return close()
        if (e.key === 'Enter') return keyboardSelect()

        if (document.activeElement === search_input) {
            if (e.key === 'ArrowDown') {
                search_input.blur()
                return nextItem()
            }
            return
        }

        e.preventDefault()

        if (e.key === 'ArrowUp') return prevItem()
        if (e.key === 'ArrowDown') return nextItem()
        if (e.key === 'ArrowLeft') return prevPage()
        if (e.key === 'ArrowRight') return nextPage()
        if (e.metaKey && e.key === 'Backspace') return deleteChat()
    }

    const fetchChats = async () => {
        let url
        if (search_value) {
            console.log('\n📂 + 🔍 Fetching chats w/ search term:', search_value)
            url = `/api/chats/search?query=${encodeURIComponent(search_value)}&page=${active_page}&per_page=10`
        } else {
            console.log('\n📂 Fetching chats...')
            url = `/api/chats?page=${active_page}&per_page=10`
        }

        chats = []

        const response = await fetch(url, {
            method:  'GET',
            headers: { 'Content-Type': 'application/json' }
        })

        if (response.ok) {
            const json = await response.json()

            chats          = json.items
            total_chats    = json.totalItems
            total_pages    = json.totalPages
            searched_value = search_value

            await tick()
            hljs.highlightAll()
            console.log(`📂–✅ Fetched ${json.items.length} items.`)
        } else {
            console.log(`📂–❌ Fetch chats failed: ${response.status} ${response.statusText}`)
            const json = await response.json()
            if (json) console.log(json)
        }
    }

    const countMessages = (messages) => messages.filter(m => m.role === 'assistant').length

    const nextPage = async () => {
        if (!(active_page < total_pages)) return
        active_page += 1

        await fetchChats()
        keyboard_index = null
    }

    const prevPage = async () => {
        if (active_page === 1) return
        active_page -= 1

        await fetchChats()
        keyboard_index = null
    }

    const prevItem = async () => {
        if (keyboard_index === 0) {
            keyboard_index = null
            search_input.focus()
            await tick()
            search_input.scrollIntoView({ behavior: 'smooth', block: 'end' })
            return
        }

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
        // temp hack
        migrateIfNeeded(chat)

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

    const migrateIfNeeded = (chat) => {
        chat.messages.forEach(message => {
            if (message.role === 'assistant' && !message.usage) {
                if (message.model.startsWith('claude')) {
                    message.model = {
                        type:           'anthropic',
                        id:             'claude-3-5-sonnet-20240620',
                        name:           'Claude 3.5 Sonnet',
                        short_name:     'Claude',
                        icon:           'claude-3-sonnet.png',
                        context_window: 200000
                    }
                } else {
                    message.model = {
                        type:           'open-ai',
                        id:             'gpt-4o-2024-08-06',
                        name:           'GPT-4o',
                        short_name:     'GPT-4o',
                        icon:           'gpt-4o.png',
                        context_window: 128000
                    }
                }
                message.temperature = 0.4
                message.top_p = 1
                message.usage = {
                    input_tokens:  1,
                    output_tokens: 1
                }
                message.timestamp = new Date(chat.updated).toISOString()
            }
        })
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
        search_input.focus()
        clearTimeout(search_timer) // prevents search from being triggered on load
    })

    onDestroy(() => {
        document.removeEventListener('keydown', keydown)
    })
</script>

<div class='loader' in:scale={{ start: 1.02, opacity: 0, duration: 200, easing: quartOut }} out:scale={{ start: 1.02, opacity: 0, duration: 100, easing: quartOut }}>
    <div class='inner'>
        <div class='search-header'>
            <div class='search-container'>
                <input
                    type='text'
                    class='search-input'
                    placeholder='Search...'
                    bind:this={search_input}
                    bind:value={search_value}
                    tabindex=1
                />
            </div>
            <div class='search-results'>
                <div class='total-chats'>
                    {total_chats} {total_chats === 1 ? 'result' : 'results'}
                    {#if searched_value}
                        for “{searched_value}”
                    {/if}
                </div>
                <div class='page-controls'>
                    <button class='prev-page-button' class:disabled={active_page === 1} on:click={prevPage}>
                        <img class='arrow' src='/img/icons/chevron-off-white.png' alt='Prev page'>
                    </button>
                    <span class='current-page'>
                        Page {active_page} / {total_pages}
                    </span>
                    <button class='next-page-button' class:disabled={!(active_page < total_pages)} on:click={nextPage}>
                        <img class='arrow' src='/img/icons/chevron-off-white.png' alt='Next page'>
                    </button>
                </div>
            </div>
            <button class='close-button' on:click={close}>
                <img class='close-icon' src='/img/icons/close-white.png' alt='Close'>
            </button>
        </div>

        <div class='chats'>
            {#each chats as chat, i}
                <button class='chat' class:keyboard-highlight={i === keyboard_index} on:click={loadChat(chat)} in:fade={{ delay: i * 10, duration: 150, easing: quartOut }}>
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
                            <img class='avatar user' src='/img/avatar.png' alt='Joe'>
                        </div>

                        {@html marked(chat.messages[1].content)}
                    </div>

                    <div class='message-count'>
                        <span class='message-count'>
                            {countMessages(chat.messages)} {countMessages(chat.messages) === 1 ? 'message' : 'messages'}
                        </span>
                        {#if chat.forks.length > 1}
                            <span class='fork-count'>
                                <span class='bull'>&bull;</span>
                                {chat.forks.length} forks
                            </span>
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
        background-color: transparentize($background-darker, 0.125)
    
    .inner
        position:       relative
        height:         100%
        box-sizing:     border-box
        padding-bottom: 128px
        overflow-y:     scroll
        +shared.scrollbar
    
    .search-header
        margin-bottom:    space.$default-padding
        padding:          space.$default-padding 0 12px
        background-color: $background-darkest
        text-align:       center
        user-select:      none

        .search-container
            margin:           0 auto
            width:            space.$main-column-width
            max-width:        720px
            box-sizing:       border-box
            padding:          16px 20px
            border:           1px solid $blue-grey
            border-radius:    12px
            background-color: $background-lighter

            &:focus-within
                border-color: $blue
                box-shadow:   0 0 0 1px $blue

        .search-input
            width:            100%
            box-sizing:       border-box
            padding-right:    16px
            line-height:      1.6
            text-align:       left
            font-family:      font.$sans-serif
            font-size:        19px
            font-weight:      600
            color:            white
            caret-color:      $blue
            background-color: transparent
            border:           none
            resize:           none

            &::placeholder
                color:       $blue-grey
                font-weight: 500

            &:focus
                outline: none
    
    .search-results
        display:         flex
        justify-content: space-between
        align-items:     center
        margin:          0 auto
        width:           space.$main-column-width
        max-width:       720px
        padding-top:     12px
        padding-left:    24px
        line-height:     64px

        .total-chats
            font-weight: 600

        .page-controls
            text-align:  center
            font-weight: 600
        
        .prev-page-button,
        .next-page-button
            margin:        0 8px
            padding:       16px 24px
            border-radius: 8px
            cursor:        pointer

            .arrow
                height: 12px
                filter: brightness(2)
            
            &:hover
                background-color: black(0.05)
            
            &:active
                background-color: black(0.1)

                .arrow
                    filter: brightness(0.8)

            &.disabled
                opacity:        0.25
                cursor:         default
                pointer-events: none

        .prev-page-button
            .arrow
                transform: rotate(180deg)
    
    .close-button
        position:    fixed
        top:         0
        right:       0
        padding:     24px space.$default-padding
        font-weight: 500
        cursor:      pointer

        .close-icon
            height: 16px
        
        &:hover
            .close-icon
                filter: brightness(0.8)

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
        +shared.code_block_styles

        &:hover
            border-color:     lighten($background-lighter, 2%)
            background-color: lighten($background-lighter, 2%)
            transition:       none
        
        &:active
            background-color: darken($background-lighter, 2%)
        
        &.keyboard-highlight
            box-shadow: 0 0 0 2px $blue

        .date
            margin-bottom: space.$default-padding
            font-weight:   600
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

                .avatar
                    height: 32px

                    &.user
                        border-radius: 8px
        
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
