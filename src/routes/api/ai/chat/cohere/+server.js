import { COHERE_API_KEY } from '$env/static/private'

export const POST = async ({ request }) => {
    let { messages, options } = await request.json()

    messages = messages.map(({ role, content }) => ({ role, content }))

    const headers = new Headers({
        'Content-Type': 'application/json',
        Authorization:  'Bearer ' + COHERE_API_KEY
    })

    const body = JSON.stringify({
        model:       options.model,
        temperature: options.temperature,
        p:           options.top_p > 0.99 ? 0.99: options.top_p,
        stream:      true,
        messages:    messages
    })

    return fetch('https://api.cohere.com/v2/chat', {
        method: 'POST',
        headers,
        body
    })
}
