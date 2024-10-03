<script>
    import { createEventDispatcher } from 'svelte'

    const dispatch = createEventDispatcher()

    export let search_input,
               search_value,
               searched_value,
               search_timer,
               total_chats,
               total_pages,
               active_page

    export const focus          = () => search_input.focus()
    export const unfocus        = () => search_input.blur()
    export const is_focused     = () => document.activeElement === search_input
    export const scrollIntoView = () => search_input.scrollIntoView({ behavior: 'smooth', block: 'end' })
    export const clear_timer    = () => clearTimeout(search_timer)
    export const set_searched   = (value) => search_value = value

    $: searchValueChanged(search_value)

    const searchValueChanged = (_) => {
        clearTimeout(search_timer)
        search_timer = setTimeout(() => {
            active_page = 1
            dispatch('fetchChats')
        }, 250)
    }
</script>

<div class='search-header'>
    <div class='search-container'>
        <!-- svelte-ignore a11y-positive-tabindex -->
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
            <button class='prev-page-button' class:disabled={active_page === 1} on:click={() => dispatch('prevPage')}>
                <img class='arrow' src='/img/icons/chevron-off-white.png' alt='Prev page'>
            </button>
            <span class='current-page'>
                Page {active_page} / {total_pages}
            </span>
            <button class='next-page-button' class:disabled={!(active_page < total_pages)} on:click={() => dispatch('nextPage')}>
                <img class='arrow' src='/img/icons/chevron-off-white.png' alt='Next page'>
            </button>
        </div>
    </div>
    <button class='close-button' on:click={() => dispatch('close')}>
        <img class='close-icon' src='/img/icons/close-white.png' alt='Close'>
    </button>
</div>

<style lang='sass'>
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
</style>
