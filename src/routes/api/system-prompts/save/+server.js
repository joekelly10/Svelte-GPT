import { json } from '@sveltejs/kit'
import PocketBase from 'pocketbase'

export const POST = async ({ request }) => {
    try {
        const { id, message, active } = await request.json()
        const pb = new PocketBase('http://localhost:4321')
        
        let record

        if (id) {
            record = await pb.collection('system_prompts').update(id, { message, active })
        } else {
            record = await pb.collection('system_prompts').create({ message, active })
        }

        return json({ record }, { status: 201 })
    } catch (error) {
        return json(error, { status: error.status })
    }
}
