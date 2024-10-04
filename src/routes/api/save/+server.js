import { json } from '@sveltejs/kit'
import PocketBase from 'pocketbase'

export const POST = async ({ request }) => {
    try {
        const { id, messages, forks, active_fork } = await request.json()
        const pb = new PocketBase('http://localhost:4321')
        
        let record

        if (id) {
            record = await pb.collection('chats').update(id, { messages, forks, active_fork })
        } else {
            record = await pb.collection('chats').create({ messages, forks, active_fork })
        }

        return json({ record }, { status: 201 })
    } catch (error) {
        return json(error, { status: error.status })
    }
}
