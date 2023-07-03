import { writable } from 'svelte/store'
import { test_data } from '$lib/test_data'
import { system_message } from '$lib/prompts/basic_chat'

export const api_status = writable('idle')
export const messages   = writable([system_message()])
