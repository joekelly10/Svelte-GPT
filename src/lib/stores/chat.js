import { writable, derived } from 'svelte/store'
import { system_message } from '$lib/prompts/basic_chat'

export const model         = createModel()
export const temperature   = writable(0.9)
export const top_p         = writable(1)
export const api_status    = writable('idle')
export const chat_id       = writable(null)
export const messages      = writable([system_message()])
export const token_count   = writable(0)
export const loader_active = writable(false)
export const loader_page   = writable(1)
export const config        = writable({ autosave: true })

export const expand_context_window = derived([token_count, model], ([$token_count, $model]) => {
    return ($token_count > $model.context_window - 512 && $model.expanded)
})

function createModel() {
    const models = [
        {
            name:           'gpt-3.5-turbo',
            display_name:   'GPT 3.5',
            icon:           'gpt-3.5.png',
            context_window: 4096,
            expanded:       {
                name:           'gpt-3.5-turbo-16k',
                display_name:   'GPT 3.5 - 16k',
                icon:           'gpt-3.5.png',
                context_window: 16384
            }
        },
        {
            name:           'gpt-4',
            display_name:   'GPT 4',
            icon:           'gpt-4.png',
            context_window: 8192,
            expanded:       null
        }
    ]

    const { subscribe, set, update } = writable(models[0])

    return {
        subscribe,
        set,
        next: () => {
            update(value => {
                if (value.name === models[0].name) return models[1]
                if (value.name === models[1].name) return models[0]
            })
        },
        setByName: (name) => {
            const model = models.find(m => m.name === name)
            if (model) set(model)
        }
    }
}
