import { writable } from 'svelte/store'
import { browser } from '$app/environment'

export const model       = createModel()
export const temperature = writable(0.7)
export const top_p       = writable(1)
export const api_status  = writable('idle')

function createModel() {
    const models = [
        {
            type:           'open-ai',
            id:             'gpt-4o-mini',
            name:           'GPT-4o mini',
            short_name:     'GPT-4o mini',
            icon:           'gpt-4o-mini.png',
            context_window: 128000
        },
        {
            type:           'open-ai',
            id:             'gpt-4o',
            name:           'GPT-4o',
            short_name:     'GPT-4o',
            icon:           'gpt-4o.png',
            context_window: 128000
        },
        {
            type:           'anthropic',
            id:             'claude-3-haiku-20240307',
            name:           'Claude 3 Haiku',
            short_name:     'Claude',
            icon:           'claude-3-haiku.png',
            context_window: 200000
        },
        {
            type:           'anthropic',
            id:             'claude-3-5-sonnet-latest',
            name:           'Claude 3.5 Sonnet',
            short_name:     'Claude',
            icon:           'claude-3-sonnet.png',
            context_window: 200000
        },
        {
            type:           'anthropic',
            id:             'claude-3-opus-latest',
            name:           'Claude 3 Opus',
            short_name:     'Claude',
            icon:           'claude-3-opus.png',
            context_window: 200000
        },
        {
            type:           'google',
            id:             'gemini-1.5-flash',
            name:           'Gemini 1.5 Flash',
            short_name:     'Gemini',
            icon:           'gemini-flash.png',
            context_window: 1000000
        },
        {
            type:           'google',
            id:             'gemini-1.5-pro',
            name:           'Gemini 1.5 Pro',
            short_name:     'Gemini',
            icon:           'gemini-pro.png',
            context_window: 1000000
        },
        {
            type:           'x',
            id:             'grok-beta',
            name:           'Grok',
            short_name:     'Grok',
            icon:           'grok.png',
            context_window: 131072
        },
        {
            type:           'cohere',
            id:             'command-r',
            name:           'Command R',
            short_name:     'Command R',
            icon:           'command-r.png',
            context_window: 128000
        },
        {
            type:           'cohere',
            id:             'command-r-plus-08-2024',
            name:           'Command R+',
            short_name:     'Command R+',
            icon:           'command-r-plus.png',
            context_window: 128000
        },
        {
            type:           'llama',
            id:             'llama3.2-11b-vision',
            name:           'Llama 3.2 11b',
            short_name:     'Llama 3 11b',
            icon:           'llama-3-light.png',
            context_window: 128000
        },
        {
            type:           'llama',
            id:             'llama3.2-90b-vision',
            name:           'Llama 3.2 90b',
            short_name:     'Llama 3 90b',
            icon:           'llama-3-medium.png',
            context_window: 128000
        },
        {
            type:           'llama',
            id:             'llama3.1-405b',
            name:           'Llama 3.1 405b',
            short_name:     'Llama 3 405b',
            icon:           'llama-3-heavy.png',
            context_window: 128000
        }
    ]

    const { subscribe, set, update } = writable(models[0])

    return {
        subscribe,
        set,
        next: () => {
            update(value => {
                let i = models.findIndex(m => m.id === value.id)
                return (i === models.length - 1) ? models[0] : models[i + 1]
            })
        },
        prev: () => {
            update(value => {
                let i = models.findIndex(m => m.id === value.id)
                return (i === 0) ? models[models.length - 1] : models[i - 1]
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
