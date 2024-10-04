import { json } from '@sveltejs/kit'
import PocketBase from 'pocketbase'

export const GET = async ({ url }) => {
    try {
        // const pb       = new PocketBase('https://low-microphone.pockethost.io')
        const pb       = new PocketBase('http://localhost:4321')
        const page     = Number(url.searchParams.get('page') ?? 1)
        const per_page = Number(url.searchParams.get('per_page') ?? 20)
        const data     = await pb.collection('chats').getList(page, per_page, {
            sort: '-updated'
        })

        return json(data, { status: 200 })
    } catch (error) {
        return json(error, { status: error.status })
    }
}
