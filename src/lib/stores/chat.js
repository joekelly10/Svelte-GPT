import { writable } from 'svelte/store'
import { getDateString } from '$lib/utils/helpers'
import { system_message } from '$lib/prompts/basic_chat'
import { test_data } from '$lib/utils/test_data'

export const api_status = writable('idle')
export const session_id = writable(getDateString())
export const messages   = writable([system_message()])
