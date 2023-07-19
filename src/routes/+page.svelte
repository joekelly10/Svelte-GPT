<script>
    import { messages, loader_active } from '$lib/stores/chat'

    import Header from '$lib/components/Header.svelte'
    import Chat from '$lib/components/Chat.svelte'
    import Input from '$lib/components/Input.svelte'
    import Loader from '$lib/components/Loader.svelte'

    let header
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
    <Header bind:this={header} />
    <Chat bind:this={chat} on:chatModified={() => { input.chatLoaded() }} on:regenerateResponse={() => input.regenerateResponse() }/>
    <Input bind:this={input} on:scrollChatToBottom={() => { chat.scrollToBottom() }} on:save={() => header.save() } />
</main>

{#if $loader_active}
    <Loader on:chatLoaded={() => { chat.scrollToBottom(); input.chatLoaded() }} />
{/if}

<style lang='sass'>
    +shared.globals

    .svelte-gpt
        display:          flex
        flex-flow:        column nowrap
        height:           100vh
        box-sizing:       border-box
        background-color: $off-black
        transition:       filter easing.$quart-out 0.1s 0.05s, transform easing.$quart-out 0.1s 0.05s

        &.blur
            transform:  scale(0.99)
            filter:     blur(4px)
            transition: filter easing.$quart-out 0.1s, transform easing.$quart-out 0.1s
</style>
