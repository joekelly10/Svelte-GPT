import { writable } from 'svelte/store'

export const system_prompts = writable([])
export const save_status = writable('idle')
