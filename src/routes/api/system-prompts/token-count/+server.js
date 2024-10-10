import { json } from '@sveltejs/kit'
import { Tiktoken } from 'tiktoken/lite'
import cl100k_base from 'tiktoken/encoders/cl100k_base.json'

export const POST = async ({ request }) => {
    const { message } = await request.json()

    const encoding = new Tiktoken(
        cl100k_base.bpe_ranks,
        cl100k_base.special_tokens,
        cl100k_base.pat_str
    )

    let token_count = encoding.encode(message).length

    encoding.free()

    return json({ token_count }, { status: 200 })
}
