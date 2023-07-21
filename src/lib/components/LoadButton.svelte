<script>
    import { loader_active } from '$lib/stores/chat.js'

    const clickedLoad = () => $loader_active = true

    const keydown = (e) => {
        if (e.metaKey && e.key === 'o') {
            e.preventDefault()
            $loader_active = !$loader_active
        }
    }
</script>

<svelte:document on:keydown={keydown} />

<button class='load-button' title='Open chat (⌘+O)' on:click={clickedLoad}>
    <svg class='icon' xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' id='unarchive'><path fill='none' d='M0 0h24v24H0V0z'></path><path d='M20.55 5.22l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.15.55L3.46 5.22C3.17 5.57 3 6.01 3 6.5V19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.49-.17-.93-.45-1.28zm-8.2 4.63L17.5 15H14v2h-4v-2H6.5l5.15-5.15c.19-.19.51-.19.7 0zM5.12 5l.82-1h12l.93 1H5.12z'></path></svg>
</button>

<style lang='sass'>
    $icon-size: 21px

    .load-button
        display:         flex
        flex-wrap:       nowrap
        justify-content: center
        align-items:     center
        width:           $icon-size + (2 * space.$default-padding)
        height:          space.$header-height
        cursor:          pointer

        &:hover
            background-color: $background-darkest
        
        &:active
            background-color: darken($background-darkest, 1%)

        .icon
            height: $icon-size
            fill:   white
</style>
