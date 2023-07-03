import { OPENAI_TOKEN } from '$env/static/private'

export const createStreamingChatCompletion = async (messages, options) => {    
    const headers = new Headers({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + OPENAI_TOKEN
    })

    const body = JSON.stringify({
        model:       options.model,
        temperature: options.temperature,
        top_p:       options.top_p,
        stream:      true,
        messages:    messages
    })

    return fetch('https://api.openai.com//v1/chat/completions', {
        method: 'POST',
        headers,
        body
    })
}
