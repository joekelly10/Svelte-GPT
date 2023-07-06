<script>
    import { messages } from '$lib/stores/chat'
    import Header from '$lib/Header.svelte'
    import Chat from '$lib/Chat.svelte'
    import Input from '$lib/Input.svelte'

    let chat
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

<main class='svelte-gpt'>
    <Header/>
    <Chat bind:this={chat} />
    <Input on:scrollChatToBottom={() => { chat.scrollToBottom() }} />
</main>


<style lang='sass'>
    +shared.globals

    .svelte-gpt
        display:    flex
        flex-flow:  column nowrap
        height:     100vh
        box-sizing: border-box
</style>
