import { writable } from 'svelte/store'
import { system_message } from '$lib/prompts/basic_chat'

export const api_status = writable('idle')
export const chat_id    = writable(null)
export const messages   = writable([system_message()])
