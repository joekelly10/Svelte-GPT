import { json } from '@sveltejs/kit'
import { Tiktoken } from 'tiktoken/lite'
import cl100k_base from 'tiktoken/encoders/cl100k_base.json'

export const POST = async ({ request }) => {
    const { messages } = await request.json()

    const encoding = new Tiktoken(
        cl100k_base.bpe_ranks,
        cl100k_base.special_tokens,
        cl100k_base.pat_str
    )

    let token_count = 0

    messages.forEach(message => {
        const tokens = encoding.encode(message.content)
        token_count += tokens.length
    })

    encoding.free()

    return json({ token_count }, { status: 200 })
}
