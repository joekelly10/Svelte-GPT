import { json } from '@sveltejs/kit'
import PocketBase from 'pocketbase'
import { POCKETBASE_URL } from '$lib/config'

export const GET = async () => {
    try {
        const pb = new PocketBase(POCKETBASE_URL)
        const data = await pb.collection('system_prompts').getFirstListItem('active=true')

        return json(data, { status: 200 })
    } catch (error) {
        return json(error, { status: error.status })
    }
}