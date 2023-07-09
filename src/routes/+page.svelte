<script>
    import { messages, loader_active } from '$lib/stores/chat'

    import Header from '$lib/Header.svelte'
    import Chat from '$lib/Chat.svelte'
    import Input from '$lib/Input.svelte'
    import Loader from '$lib/Loader.svelte'

    let chat
    let input
    let title

    $: {
        if ($messages.length > 1) {
            title = $messages[1].content
        } else {
            title = 'Svelte GPT'
        }
    }
</script>

<svelte:head>
    <title>{title}</title>
    <link rel='stylesheet' href='https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/styles/github-dark.min.css'>
</svelte:head>

<main class='svelte-gpt' class:blur={$loader_active}>
    <Header/>
    <Chat bind:this={chat} />
    <Input bind:this={input} on:scrollChatToBottom={() => { chat.scrollToBottom() }} />
</main>

{#if $loader_active}
    <Loader on:chatLoaded={() => { chat.scrollToBottom(); input.autofocus() }} />
{/if}

<style lang='sass'>
    +shared.globals

    .svelte-gpt
        display:          flex
        flex-flow:        column nowrap
        height:           100vh
        box-sizing:       border-box
        background-color: $off-black
        transition:       filter easing.$quart-out 0.25s, transform easing.$quart-out 0.25s

        &.blur
            transform: scale(0.99)
            filter:    blur(4px)
</style>
