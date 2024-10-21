import { OPENAI_TOKEN } from '$env/static/private'

export const POST = async ({ request }) => {
    let { messages, options } = await request.json()

    // strip all properties except `role` + `content` else you get a 400
    messages = messages.map(({ role, content }) => ({ role, content }))

    const headers = new Headers({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + OPENAI_TOKEN
    })

    const body = JSON.stringify({
        model:          options.model,
        temperature:    options.temperature,
        top_p:          options.top_p,
        stream:         true,
        stream_options: { include_usage: true },
        messages:       messages
    })

    return fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers,
        body
    })
}
