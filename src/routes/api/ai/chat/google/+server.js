import { GEMINI_API_KEY } from '$env/static/private'

export const POST = async ({ request }) => {
    let { messages, options } = await request.json()

    let contents = []
    messages.slice(1).forEach(message => {
        contents.push({
            role:  message.role === 'assistant' ? 'model': 'user',
            parts: [{ text: message.content }]
        })
    })

    const headers = new Headers({
        'Content-Type': 'application/json'
    })

    const body = JSON.stringify({
        generationConfig: {
            temperature: options.temperature,
            topP:        options.top_p
        },
        systemInstruction: {
            role:  'system',
            parts: [{ text: messages[0]?.content }]
        },
        safetySettings: [
            { category:  'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category:  'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category:  'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category:  'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category:  'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' }
        ],
        contents
    })
    
    return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${options.model}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers,
        body
    })
}
