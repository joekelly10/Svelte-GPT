<script>
    import { onMount, onDestroy, tick } from 'svelte'
    import { scale } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { prompt_editor_active, messages } from '$lib/stores/chat'
    import { system_prompts, save_status } from '$lib/stores/prompt_editor'
    import PromptEditorHeader from '$lib/components/PromptEditor/PromptEditorHeader.svelte'
    import PromptList from '$lib/components/PromptEditor/PromptList.svelte'
    import EditPromptForm from '$lib/components/PromptEditor/EditPromptForm.svelte'

    let form,
        input_title,
        input_message,
        read_only

    let current_prompt_index = 0

    $: read_only = $messages.length > 1
    $: is_new_prompt = !$system_prompts[current_prompt_index]?.id

    const close = () => {
        $system_prompts = $system_prompts.filter(prompt => !!prompt.id)
        $prompt_editor_active = false
    }

    const fetchSystemPrompts = async () => {
        console.log('📝 Fetching system prompts...')
        const response = await fetch('/api/system-prompts')

        if (response.ok) {
            const data = await response.json()
            $system_prompts = data
            console.log(`📝–✅ Fetched: ${$system_prompts.length} prompts.`)
        } else {
            console.log(`📝–❌ Fetch system prompts failed: ${response.status} ${response.statusText}`)
            const json = await response.json()
            if (json) console.log(json)
        }
    }

    const selectPrompt = async (index) => {
        current_prompt_index = index
        input_title          = $system_prompts[current_prompt_index].title
        input_message        = $system_prompts[current_prompt_index].message

        await tick()
        if (is_new_prompt) form.focusTitle()
    }

    const deleteCurrentPrompt = async () => {
        if (is_new_prompt) {
            $system_prompts = $system_prompts.slice(1)
            selectPrompt(0)
        } else {
            const prompt = $system_prompts[current_prompt_index]

            if (prompt.default) {
                alert(`You can't delete the default prompt.`)
                return
            }

            console.log(`🗑️ Deleting prompt: ${prompt.id}...`)

            const response = await fetch(`/api/system-prompts/${prompt.id}`, {
                method:  'DELETE',
                headers: { 'Content-Type': 'application/json' }
            })

            if (response.ok) {
                console.log(`🗑️–✅ Prompt deleted.`)
                if (current_prompt_index === $system_prompts.length - 1) {
                    current_prompt_index--
                }
                await fetchSystemPrompts()
                selectPrompt(current_prompt_index)
            } else {
                console.log(`🗑️–❌ Delete failed: ${response.status} ${response.statusText}`)
                const json = await response.json()
                if (json) console.log(json)
            }
        }
    }

    const keydown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault()
            return close()
        }
        if (e.metaKey && e.key === 'Enter') {
            e.preventDefault()
            return form.save()
        }
    }

    onMount(async () => {
        document.addEventListener('keydown', keydown)
        input_title   = $messages[0].system_prompt_title ?? '(no title)'
        input_message = $messages[0].content
        $save_status  = 'idle'
        if (!read_only) await fetchSystemPrompts()
    })

    onDestroy(() => {
        document.removeEventListener('keydown', keydown)
    })
</script>

<div class='prompt-editor' class:read-only={read_only} in:scale={{ start: 1.02, opacity: 0, duration: 200, easing: quartOut }} out:scale={{ start: 1.02, opacity: 0, duration: 100, easing: quartOut }}>
    <div class='inner'>
        <PromptEditorHeader
            read_only={read_only}
            on:close={close}
        />

        {#if !read_only}
            <PromptList
                current_prompt_index={current_prompt_index}
                on:selectPrompt={(event) => selectPrompt(event.detail.index)}
            />
        {/if}

        <EditPromptForm
            bind:this={form}
            bind:input_title
            bind:input_message
            current_prompt_index={current_prompt_index}
            read_only={read_only}
            on:deletePrompt={deleteCurrentPrompt}
            on:cancel={() => close()}
            on:close={() => close()}
        />
    </div>
</div>

<style lang='sass'>
    .prompt-editor
        position:         fixed
        top:              0
        left:             0
        z-index:          99
        width:            100vw
        height:           100vh
        background-color: color.adjust($background-darker, $alpha: -0.125)

    .inner
        display:         flex
        align-items:     center
        justify-content: center
        gap:             96px
        height:          100%
</style>
