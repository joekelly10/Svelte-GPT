import { json } from '@sveltejs/kit'
import PocketBase from 'pocketbase'

export const GET = async ({ url }) => {
    try {
        const pb       = new PocketBase('http://localhost:54320'),
              page     = Number(url.searchParams.get('page') ?? 1),
              per_page = Number(url.searchParams.get('per_page') ?? 20),
              query    = url.searchParams.get('query') ?? ''

        const data = await pb.collection('chats').getList(page, per_page, {
            sort: '-updated',
            filter: `messages ~ "${query}"`
        })

        // TODO: If query string matches on json keys,
        //       then handle further filtering of these
        //       special cases manually

        return json(data, { status: 200 })
    } catch (error) {
        return json(error, { status: error.status })
    }
}
