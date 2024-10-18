# What?

*Svelte GPT* is a Chat UI for interacting with language model APIs.

- Frontend: [Svelte](https://svelte.dev/)
- Backend: [SvelteKit](https://kit.svelte.dev/)
- Database: [Pocketbase](https://pocketbase.io/)

It runs in your browser on `localhost:1337`.



# Why?

- 🤖 Use multiple models
    - Have a conversation with `gpt-4o` then switch to `Claude 3.5 Sonnet`
    - Ask the same question to multiple models
- 🔧 Control model settings (`temperature`, `top_p`, etc.)
- 📝 Control the `system_prompt`
- 🚀 Quickly launch a new chat from anywhere (e.g. via Alfred)
    - I.e. You can input a prompt + select which model to use via URL query parameters
- 📐 Fork chats
    - Surprisingly useful feature!
    - I don't think anyone has done this yet
    - But I use it all the time
- 🔍 Searchable history
- 💰 API usage / per token pricing means you:
    - 🤝 Save up to $25/mo vs. ChatGPT Plus if you don't actually use it that much
    - 🤝 Save up to $50+/mo compared to 2+ monthly subscriptions to multiple services



# Models

**Open AI**
- <img alt='GPT-4o mini' src='./static/img/icons/models/gpt-4o-mini.png' width='21' height='21' valign='middle'>&nbsp; GPT-4o mini
- <img alt='GPT-4o' src='./static/img/icons/models/gpt-4o.png' width='21' height='21' valign='middle'>&nbsp; GPT-4o

**Anthropic**
- <img alt='Claude Haiku' src='./static/img/icons/models/claude-3-haiku.png' width='21' height='21' valign='middle'>&nbsp; Claude 3 Haiku
- <img alt='Claude Sonnet' src='./static/img/icons/models/claude-3-sonnet.png' width='21' height='21' valign='middle'>&nbsp; Claude 3.5 Sonnet

**Google**
- <img alt='Gemini Flash' src='./static/img/icons/models/gemini-flash.png' width='21' height='21' valign='middle'>&nbsp; Gemini 1.5 Flash
- <img alt='Gemini Pro' src='./static/img/icons/models/gemini-pro.png' width='21' height='21' valign='middle'>&nbsp; Gemini 1.5 Pro

**Cohere**
- <img alt='Command-R' src='./static/img/icons/models/command-r.png' width='21' height='21' valign='middle'>&nbsp; Command-R
- <img alt='Command-R+' src='./static/img/icons/models/command-r-plus.png' width='21' height='21' valign='middle'>&nbsp; Command-R+

**Meta/OS** (via llama-api.com)
- <img alt='Llama 3.2 11b' src='./static/img/icons/models/llama-3-light.png' width='21' height='21' valign='middle'>&nbsp; Llama 3.2 11b
- <img alt='Llama 3.2 70b' src='./static/img/icons/models/llama-3-medium.png' width='21' height='21' valign='middle'>&nbsp; Llama 3.2 70b
- <img alt='Llama 3.1 405b' src='./static/img/icons/models/llama-3-heavy.png' width='21' height='21' valign='middle'>&nbsp; Llama 3.1 405b



# Install

1. Download the latest [Pocketbase release](https://pocketbase.io/docs/)
    - Put the `pocketbase` executable in the `/pocketbase/` folder
    - Run `pocketbase` for the first time to initialise it
        - On MacOS you may need to do `⌘+Click` -> `Open` -> `Confirm open`
    - Close the terminal window once it's done


2. Create a `.env` file in the root directory, add `OPENAI_TOKEN=<your_token_goes_here>` and save:
```
OPENAI_TOKEN=sk-YoUrOpEnAiAcCeSsToKeNtHaTyOuGeTfRoMtHeIrWeBsItE
ANTHROPIC_API_KEY=...
GEMINI_API_KEY=...
COHERE_API_KEY=...
LLAMA_API_KEY=...
```


3. Install dependencies
```
npm install
```


4. Compile the SvelteKit app:
```
npm run build
```


5. Launch both Pocketbase and Svelte GPT with the shell script:
```
./start.sh
```
   - (Note: You can also run Svelte GPT in dev mode, with live reloading, by running `./start.sh dev`)



6. Go to `http://localhost:1336/_/` (⌘+click the link) and add an admin email + password to finish setting up Pocketbase


7. Go to `http://localhost:1337` and start chatting.



# Please Note

This isn't finished, production ready code - it's a personal project that I originally had no intention of sharing. I could be persuaded to develop it properly, but it works for my needs and I'm currently focused on other things!
