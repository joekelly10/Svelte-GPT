import { ANTHROPIC_API_KEY } from '$env/static/private'

export const POST = async ({ request }) => {
    let { messages, options } = await request.json()

    // strip all properties except `role` + `content` else you get a 400
    messages = messages.map(({ role, content }) => ({ role, content }))

    const headers = new Headers({
        'Content-Type':      'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key':         ANTHROPIC_API_KEY
    })

    const body = JSON.stringify({
        model:       options.model,
        temperature: options.temperature,
        top_p:       options.top_p,
        stream:      true,
        system:      messages[0]?.content,
        messages:    messages.slice(1),
        max_tokens:  4096
    })

    return fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers,
        body
    })
}
