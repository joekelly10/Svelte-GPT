import { json } from '@sveltejs/kit'
import PocketBase from 'pocketbase'
import { POCKETBASE_URL } from '$lib/config'

export const GET = async () => {
    try {
        const pb             = new PocketBase(POCKETBASE_URL)
        const default_prompt = await pb.collection('system_prompts').getFirstListItem('default=true')

        return json(default_prompt, { status: 200 })
    } catch (error) {
        return json(error, { status: error.status })
    }
}
