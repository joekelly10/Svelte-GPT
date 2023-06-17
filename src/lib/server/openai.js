import { OPENAI_TOKEN } from '$env/static/private'
import { system_message } from '$lib/prompts/basic_chat'

export const createStreamingChatCompletion = async (user_message, options) => {
    const headers = new Headers({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + OPENAI_TOKEN
    })

    const body = JSON.stringify({
        model:       'gpt-3.5-turbo-0613',
        temperature: 0.9,
        top_p:       1,
        stream:      true,
        messages:    [
            { role: 'system', content: system_message },
            { role: 'user', content: user_message }
        ],
    })

    return fetch('https://api.openai.com//v1/chat/completions', {
        method: 'POST',
        headers,
        body
    })
}
