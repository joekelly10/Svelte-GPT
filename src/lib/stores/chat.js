import { writable, derived } from 'svelte/store'
import { browser } from '$app/environment'
import { system_message } from '$lib/prompts/basic_chat'
import { getCost } from '$lib/utils/helpers'

export const model            = createModel()
export const temperature      = writable(0.7)
export const top_p            = writable(1)
export const api_status       = writable('idle')
export const chat_id          = writable(null)
export const messages         = writable([system_message()])
export const forks            = writable([{ message_ids: [0], forked_at: [], provisional: false }])
export const active_fork      = writable(0)
export const token_count      = writable(0)
export const loader_active    = writable(false)
export const shortcuts_active = writable(false)
export const config           = writable({ autosave: true })

export const active_messages = derived([messages, forks, active_fork], ([$messages, $forks, $active_fork]) => {

    //  There can be a temporary disconnect here when loading a chat, because
    //  `forks` and `active_fork` are updated sequentially, not atomically,
    //  so we return `forks[0]` by default:

    if (!$forks[$active_fork]) {
        return $messages.filter(m => $forks[0].message_ids.includes(m.id))
    } else {
        return $messages.filter(m => $forks[$active_fork].message_ids.includes(m.id))
    }
})

export const fork_points = derived(forks, ($forks) => {
    if ($forks.length === 1) return []

    let message_id_pairs = []

    $forks.forEach(fork => {
        fork.forked_at.forEach(message_id => {
            const index = fork.message_ids.findIndex(id => id === message_id)
            const next  = fork.message_ids[index + 1]
            message_id_pairs.push([message_id, next])
        })
    })

    // Remove duplicates (keep only first occurrence of each)
    return message_id_pairs.filter((pair, index, self) => self.findIndex(p => p[0] === pair[0] && p[1] === pair[1]) === index)
})

export const usage = derived(messages, ($messages) => {
    const filtered       = $messages.filter(m => m.role === 'assistant')
    const total_messages = filtered.length

    let input_tokens  = 0,
        output_tokens = 0,
        total_cost    = 0

    filtered.forEach(message => {
        input_tokens  += message.usage.input_tokens
        output_tokens += message.usage.output_tokens
        total_cost    += getCost(message.model.id, message.usage).total
    })

    return { total_messages, input_tokens, output_tokens, total_cost }
})

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
            id:             'claude-3-5-sonnet-20240620',
            name:           'Claude 3.5 Sonnet',
            short_name:     'Claude',
            icon:           'claude-3-sonnet.png',
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
            type:           'cohere',
            id:             'command-r',
            name:           'Command R',
            short_name:     'Command R',
            icon:           'command-r.png',
            context_window: 128000
        },
        {
            type:           'cohere',
            id:             'command-r-plus',
            name:           'Command R+',
            short_name:     'Command R+',
            icon:           'command-r-plus.png',
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
