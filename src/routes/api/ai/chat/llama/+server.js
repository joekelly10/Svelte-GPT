import { LLAMA_API_KEY } from '$env/static/private'

export const POST = async ({ request }) => {
    let { messages, options } = await request.json()

    // strip all properties except `role` + `content` else you get a 400
    messages = messages.map(({ role, content }) => ({ role, content }))

    const headers = new Headers({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + LLAMA_API_KEY
    })

    const body = JSON.stringify({
        model:       options.model,
        temperature: options.temperature,
        top_p:       options.top_p,
        stream:      true,
        messages:    messages
    })

    return fetch('https://api.llama-api.com/chat/completions', {
        method: 'POST',
        headers,
        body
    })
}
