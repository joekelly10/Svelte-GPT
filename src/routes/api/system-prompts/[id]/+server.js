import { json } from '@sveltejs/kit'
import PocketBase from 'pocketbase'
import { POCKETBASE_URL } from '$lib/config'

export const DELETE = async ({ params }) => {
    try {
        const pb     = new PocketBase(POCKETBASE_URL)
        const active = await pb.collection('system_prompts').getFirstListItem('active=true')

        if (params.id === active.id) {
            const default_prompt = await pb.collection('system_prompts').getFirstListItem('default=true')
            await pb.collection('system_prompts').update(default_prompt.id, { active: true })
        }

        const data = await pb.collection('system_prompts').delete(params.id)

        return json(data, { status: 204 })
    } catch (error) {
        return json(error, { status: error.status })
    }
}
