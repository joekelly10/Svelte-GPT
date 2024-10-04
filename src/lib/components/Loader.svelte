<script>
    import hljs from 'highlight.js'
    import { chat_id, messages, forks, active_fork, token_count, loader_active } from '$lib/stores/chat.js'
    import { onMount, onDestroy, tick, createEventDispatcher } from 'svelte'
    import { scale } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { addCopyButtons } from '$lib/utils/helpers'
    import Search from '$lib/components/Loader/Search.svelte'
    import LoaderChat from '$lib/components/Loader/LoaderChat.svelte'
    
    const dispatch = createEventDispatcher()
    
    let chats          = [],
        keyboard_index = null,
        total_chats    = 0,
        total_pages    = 0,
        active_page    = 1,
        deleting       = false
    
    let search,
        search_value,
        searched_value

    const close = () => $loader_active = false

    const keydown = (e) => {
        if (e.key === 'Escape') return close()
        if (e.key === 'Enter') return keyboardSelect()

        if (search.is_focused()) {
            if (e.key === 'ArrowDown') {
                search.unfocus()
                return nextItem()
            }
            return
        }

        e.preventDefault()

        if (e.key === 'ArrowUp') return prevItem()
        if (e.key === 'ArrowDown') return nextItem()
        if (e.key === 'ArrowLeft') return prevPage()
        if (e.key === 'ArrowRight') return nextPage()
        if (e.metaKey && e.key === 'Backspace') return keyboardDelete()
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
            search.focus()
            await tick()
            search.scrollIntoView()
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

    const keyboardDelete = async () => {
        const chat = chats[keyboard_index]
        document.querySelector('.keyboard-highlight').classList.add('selected')

        await deleteChat(chat)
        document.querySelector('.keyboard-highlight').scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    const deleteChat = async (chat) => {
        deleting = true
        await tick()

        let excerpt
        if (chat.messages[1].content.length < 100) {
            excerpt = '“' + chat.messages[1].content + '”'
        } else {
            excerpt = '“' + chat.messages[1].content.substring(0,99) + '...”'
        }

        if (confirm(`Delete chat?\n\n${excerpt}\n\nPress OK to confirm.`)) {
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

                chats = chats.filter(c => c.id !== chat.id)

                if (!chats.length) {
                    keyboard_index = null
                    await fetchChats()
                }

                if (keyboard_index > chats.length - 1) keyboard_index = chats.length - 1
            } else {
                console.log(`🗑️–❌ Delete failed: ${response.status} ${response.statusText}`)
                const json = await response.json()
                if (json) console.log(json)
            }
        }

        deleting = false
        await tick()
    }

    onMount(() => {
        document.addEventListener('keydown', keydown)
        fetchChats()
        search.focus()
        search.clear_timer() // prevents search from being triggered on load
    })

    onDestroy(() => {
        document.removeEventListener('keydown', keydown)
    })
</script>

<div class='loader' in:scale={{ start: 1.02, opacity: 0, duration: 200, easing: quartOut }} out:scale={{ start: 1.02, opacity: 0, duration: 100, easing: quartOut }}>
    <div class='inner'>
        <Search
            bind:this={search}
            bind:search_value={search_value}
            bind:searched_value={searched_value}
            total_chats={total_chats}
            total_pages={total_pages}
            active_page={active_page}
            on:fetchChats={fetchChats}
            on:nextPage={nextPage}
            on:prevPage={prevPage}
            on:close={close}
        />

        <div class='chats'>
            {#each chats as chat, i (chat.id)}
                <LoaderChat
                    chat={chat}
                    index={i}
                    keyboard_index={keyboard_index}
                    deleting={deleting}
                    on:loadChat={(event) => { loadChat(event.detail.chat) }}
                    on:deleteChat={(event) => { deleteChat(event.detail.chat) }}
                />
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

    .chats
        margin: 0 auto
        width:  800px
</style>
