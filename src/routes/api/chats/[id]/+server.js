import { json } from '@sveltejs/kit'
import PocketBase from 'pocketbase'

export const DELETE = async ({ params }) => {
    try {
        // const pb   = new PocketBase('https://low-microphone.pockethost.io')
        const pb   = new PocketBase('http://localhost:54320')
        const data = await pb.collection('chats').delete(params.id)

        return json(data, { status: 204 })
    } catch (error) {
        return json(error, { status: error.status })
    }
}
