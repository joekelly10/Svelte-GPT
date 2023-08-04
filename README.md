# What?

*Svelte GPT* is a Chat UI for interacting with Large Language Models via APIs.

- Frontend: [Svelte](https://svelte.dev/)
- Backend: [SvelteKit](https://kit.svelte.dev/)
- Database: [Pocketbase](https://pocketbase.io/)

It runs in your browser on `localhost:1337`.



# Why?

- 🚀 Launch a new chat from anywhere (via Alfred)
    - I.e. You can input a prompt + select which model to use via URL query parameters
    - This isn't possible on chat.openai.com
- 💡 Use any model
- ⚙️ Control the model settings
- 📝 Control the `system_prompt`
- 🏆 Fork chats
    - Surprisingly useful feature!
    - I don't think anyone has done this yet
- 📐 Automatic model switching when context window reached
    - I.e. Intelligently switches from `gpt-3.5-turbo` to `gpt-3.5-turbo-16k` at the 4096 token limit
- 💰 Save $25/mo if you don't actually use ChatGPT that much



# Install

1. Download the latest [Pocketbase release](https://pocketbase.io/docs/)

- Put the `pocketbase` executable in the `pocketbase/` folder
- Run `pocketbase` for the first time to initialise it
    - On MacOS you may need to do `⌘+Click` -> `Open` -> `Confirm open`
- Close the terminal window once it's done


2. Create a `.env` file in the root directory, add `OPENAI_TOKEN=<your_token_goes_here>` and save:
```
OPENAI_TOKEN=sk-YoUrOpEnAiAcCeSsToKeNtHaTyOuGeTfRoMtHeIrWeBsItE
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
./start.sh`
```

(Note: You can also run Svelte GPT in dev mode, with live reloading, by running `./start.sh dev`)



6. Go to `http://localhost:1336/_/` (⌘+click the link) and add an admin email + password to finish setting up Pocketbase


7. Go to `http://localhost:1337` and start chatting.



# Please Note

This isn't finished, production ready code - it's a personal project that I use and originally had no intention of sharing. I could be persuaded to develop it properly, but it works for my needs and I'm currently focused on other things.
