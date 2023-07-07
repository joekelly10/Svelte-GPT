import { json } from '@sveltejs/kit'
import PocketBase from 'pocketbase'

export const POST = async ({ request }) => {
    const { id, messages } = await request.json()
        
    const pb = new PocketBase('http://localhost:1336')

    try {
        let record

        if (id) {
            record = await pb.collection('chats').update(id, { messages })
        } else {
            record = await pb.collection('chats').create({ messages })
        }

        return json({ record }, { status: 201 })
    } catch (error) {
        return json(error, { status: error.status })
    }
}
