import { json } from '@sveltejs/kit'
import PocketBase from 'pocketbase'

export const GET = async () => {
    try {
        const pb = new PocketBase('http://localhost:4321')
        const data = await pb.collection('system_prompts').getFirstListItem('active=true')

        return json(data, { status: 200 })
    } catch (error) {
        return json(error, { status: error.status })
    }
}