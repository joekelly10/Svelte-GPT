import { json } from '@sveltejs/kit'
import { OPENAI_TOKEN } from '$env/static/private'
import { Configuration, OpenAIApi } from 'openai'
import { system_message } from '$lib/prompts/basic_chat'

export const POST = async ({ request }) => {
    const { user_message, temperature = 0.9, top_p = 1 } = await request.json()

    const config = new Configuration({ apiKey: OPENAI_TOKEN })
    const openai = new OpenAIApi(config)

    try {
        const chat_completion = await openai.createChatCompletion({
            model:       'gpt-3.5-turbo-0613',
            temperature: temperature,
            top_p:       top_p,
            messages:    [
                { role: 'system', content: system_message },
                { role: 'user', content: user_message }
            ],
        })
        
        return json(chat_completion.data, { status: 201 })
    } catch (err) {
        if (err.response) {
            return json(err.response.data, err.response.status)
        } else {
            return json(err.message, 400)
        }
    }
}
