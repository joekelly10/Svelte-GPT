import { writable, derived } from 'svelte/store'
import { browser } from '$app/environment'
import { system_message } from '$lib/prompts/basic_chat'

export const model            = createModel()
export const temperature      = writable(0.7)
export const top_p            = writable(1)
export const api_status       = writable('idle')
export const chat_id          = writable(null)
export const messages         = writable([system_message()])
export const token_count      = writable(0)
export const loader_active    = writable(false)
export const loader_page      = writable(1)
export const shortcuts_active = writable(false)
export const config           = writable({ autosave: true })

export const expand_context_window = derived([token_count, model], ([$token_count, $model]) => {
    return ($token_count > $model.context_window - 512 && $model.expanded)
})

function createModel() {
    const models = [
        {
            id:             'gpt-3.5-turbo',
            name:           'GPT 3.5',
            icon:           'gpt-3.5.png',
            context_window: 4096,
            expanded:       {
                id:             'gpt-3.5-turbo-16k',
                name:           'GPT 3.5 - 16k',
                icon:           'gpt-3.5.png',
                context_window: 16384
            }
        },
        {
            id:             'gpt-4',
            name:           'GPT 4',
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
                if (value.id === models[0].id) return models[1]
                if (value.id === models[1].id) return models[0]
            })
        },
        setById: (id) => {
            const model = models.find(m => m.id === id)
            if (model) set(model)
        }
    }
}

if (browser) {
    const stored_temperature = Number(localStorage.getItem('temperature'))
    const stored_top_p       = Number(localStorage.getItem('top_p'))

    if (stored_temperature) temperature.set(stored_temperature)
    if (stored_top_p) top_p.set(stored_top_p)

    temperature.subscribe(value => localStorage.setItem('temperature', value))
    top_p.subscribe(value => localStorage.setItem('top_p', value))
}
