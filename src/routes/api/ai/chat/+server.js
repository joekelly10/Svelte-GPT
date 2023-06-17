import { createStreamingChatCompletion } from '$lib/server/openai'

export const POST = async ({ request }) => {
    const { user_message } = await request.json()

    return createStreamingChatCompletion(user_message)
}
