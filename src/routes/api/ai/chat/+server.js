import { createStreamingChatCompletion } from '$lib/server/openai'
import { system_message } from '$lib/prompts/basic_chat'

export const POST = async ({ request }) => {
    const { messages, options } = await request.json()

    return createStreamingChatCompletion(messages, options)
}
