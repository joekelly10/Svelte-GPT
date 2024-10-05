import { writable, derived } from 'svelte/store'
import { system_message } from '$lib/prompts/basic_chat'
import { getCost } from '$lib/utils/helpers'

export const chat_id          = writable(null)
export const messages         = writable([system_message()])
export const forks            = writable([{ message_ids: [0], forked_at: [], provisional: false }])
export const active_fork      = writable(0)
export const shortcuts_active = writable(false)
export const loader_active    = writable(false)
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
