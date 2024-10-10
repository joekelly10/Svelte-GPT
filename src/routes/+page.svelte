<script>
    import { messages, loader_active, prompt_editor_active } from '$lib/stores/chat'

    import Header from '$lib/components/Header.svelte'
    import Chat from '$lib/components/Chat.svelte'
    import Input from '$lib/components/Input.svelte'
    import Loader from '$lib/components/Loader.svelte'
    import PromptEditor from '$lib/components/Chat/PromptEditor.svelte'

    let header,
        chat,
        input,
        title

    $: title = $messages.length > 1 ? $messages[1].content : 'Svelte GPT'

    const save               = () => header.save()
    const chatModified       = () => input.chatLoaded()
    const regenerateResponse = () => input.regenerateResponse()
    const sendingMessage     = () => chat.sendingMessage()
    const scrollChatToBottom = () => chat.scrollToBottom()
    const chatLoaded         = () => { chat.scrollToBottom(150); input.chatLoaded() }
</script>

<svelte:head>
    <title>{title}</title>
    <link rel='stylesheet' href='https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/styles/github-dark.min.css'>
</svelte:head>

<main class='svelte-gpt' class:blur={$loader_active || $prompt_editor_active}>
    <Header
        bind:this={header}
    />
    <Chat
        bind:this={chat}
        on:chatModified={chatModified}
        on:regenerateResponse={regenerateResponse}
    />
    <Input
        bind:this={input}
        on:sendingMessage={sendingMessage}
        on:scrollChatToBottom={scrollChatToBottom}
        on:save={save}
    />
</main>

{#if $loader_active}
    <Loader
        on:chatLoaded={chatLoaded}
    />
{/if}

{#if $prompt_editor_active}
    <PromptEditor/>
{/if}

<style lang='sass'>
    +shared.globals

    .svelte-gpt
        display:          flex
        flex-flow:        column nowrap
        height:           100vh
        box-sizing:       border-box
        background-color: $background
        transition:       filter easing.$quart-out 0.1s 0.05s, transform easing.$quart-out 0.1s 0.05s

        &.blur
            transform:  scale(0.99)
            filter:     blur(4px)
            transition: filter easing.$quart-out 0.1s, transform easing.$quart-out 0.1s
</style>
