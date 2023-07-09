<script>
    import hljs from 'highlight.js'
    import { marked } from 'marked'
    import { chat_id, messages, loader_active, loader_page } from '$lib/stores/chat.js'
    import { onMount, onDestroy, tick, createEventDispatcher } from 'svelte'
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { formatDate, addCopyButtons } from '$lib/utils/helpers'

    marked.use({ mangle: false, headerIds: false })
    
    const dispatch = createEventDispatcher()
    
    let chats = []
    
    let total_chats
    let total_pages

    const close   = () => $loader_active = false
    const keydown = (e) => { if (e.key === 'Escape') close() }

    const fetchChats = async () => {
        console.log('📂 Fetching chats...')

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
        $loader_page += 1
        fetchChats()
    }

    const prevPage = async () => {
        $loader_page -= 1
        fetchChats()
    }

    const loadChat = async (chat) => {
        $messages = chat.messages
        $chat_id  = chat.id

        await tick()

        hljs.highlightAll()
        addCopyButtons()
        close()
    
        dispatch('chatLoaded')
    }

    onMount(() => {
        document.addEventListener('keydown', keydown)
        fetchChats()
    })

    onDestroy(() => {
        document.removeEventListener('keydown', keydown)
    })
</script>

<div class='loader' in:fade={{ duration: 250, delay: 50, easing: quartOut }} out:fade={{ duration: 50, easing: quartOut }}>
    <div class='inner'>
        <button class='close-button' on:click={close}>
            Close
        </button>

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

        <div class='chats'>
            {#each chats as chat}
                <button class='chat' on:click={loadChat(chat)}>
                    <div class='date'>
                        {@html formatDate(chat.updated)}
                        {#if chat.id === $chat_id}
                            <span class='active'>
                                (active now)
                            </span>
                        {/if}
                    </div>
                    
                    {@html marked(chat.messages[1].content)}

                    <div class='message-count'>
                        {chat.messages.length - 1} messages
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
        background-color: transparentize($darker-black, 0.175)
    
    .inner
        position:       relative
        height:         100%
        box-sizing:     border-box
        padding-bottom: 128px
        overflow-y:     scroll
        +shared.scrollbar
    
    .close-button
        position:    absolute
        top:         0
        right:       0
        padding:     24px space.$default-padding
        font-weight: 500
        cursor:      pointer
    
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
        border:           1px solid $lighter-black
        background-color: $lighter-black
        text-align:       left
        cursor:           pointer
        transition:       border easing.$quart-out 0.125s
        +shared.code_block_styles

        &:hover
            border:     1px solid $blue-grey
            transition: none
        
        &:active
            background-color: darken($lighter-black, 2%)

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
        
        .message-count
            margin-top: space.$default-padding
            color:      $blue-grey
</style>
