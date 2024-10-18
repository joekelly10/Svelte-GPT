import { json } from '@sveltejs/kit'
import PocketBase from 'pocketbase'
import { POCKETBASE_URL } from '$lib/config'

export const DELETE = async ({ params }) => {
    try {
        const pb   = new PocketBase(POCKETBASE_URL)
        const data = await pb.collection('chats').delete(params.id)

        return json(data, { status: 204 })
    } catch (error) {
        return json(error, { status: error.status })
    }
}
