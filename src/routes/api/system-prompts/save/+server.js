import { json } from '@sveltejs/kit'
import PocketBase from 'pocketbase'
import { POCKETBASE_URL } from '$lib/config'

export const POST = async ({ request }) => {
    try {
        const { deactivate, save_and_activate } = await request.json()
        const pb = new PocketBase(POCKETBASE_URL)

        let prompt

        if (!save_and_activate.id) {
            //  creating a new prompt
            await pb.collection('system_prompts').update(deactivate.id, { active: false })
            prompt = await pb.collection('system_prompts').create({
                title:   save_and_activate.title,
                message: save_and_activate.message,
                active:  true
            })
        } else if (deactivate.id === save_and_activate.id) {
            //  overwriting currently active prompt (so skip deactivation)
            prompt = await pb.collection('system_prompts').update(save_and_activate.id, {
                title:   save_and_activate.title,
                message: save_and_activate.message,
                active:  true
            })
        } else {
            //  switching prompt (deactivate old, activate new)
            await pb.collection('system_prompts').update(deactivate.id, { active: false })
            prompt = await pb.collection('system_prompts').update(save_and_activate.id, {
                title:   save_and_activate.title,
                message: save_and_activate.message,
                active:  true
            })
        }

        return json(prompt, { status: 201 })
    } catch (error) {
        return json(error, { status: error.status })
    }
}
