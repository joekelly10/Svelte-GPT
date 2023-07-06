import { dev } from "$app/environment";
import { json } from '@sveltejs/kit'
import { PROJECT_ROOT } from '$lib/utils/project_root'
import fs from 'fs'

export const POST = async ({ request }) => {
    const { messages, filename } = await request.json()

    const filepath = dev ? `static/saved/${filename}` : PROJECT_ROOT + `/client/saved/${filename}`
    fs.writeFileSync(filepath, JSON.stringify({ messages }))

    return json({ saved: filepath }, { status: 201 })
}
