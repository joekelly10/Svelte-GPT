export const isStreamedChatCompletion = (data) => {
    try {
        return typeof data === 'object' && data.choices[0].delta.content
    } catch {
        return false
    }
}
