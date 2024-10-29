import { json } from '@sveltejs/kit'
import { Tiktoken } from 'tiktoken/lite'
import cl100k_base from 'tiktoken/encoders/cl100k_base.json'

export const POST = async ({ request }) => {
    const { messages } = await request.json()

    let cached_tokens = 0,
        input_tokens  = 0,
        output_tokens = 0

    const input_messages = messages.slice(0, -1),
          output_message = messages[messages.length - 1]

    const encoding = new Tiktoken(
        cl100k_base.bpe_ranks,
        cl100k_base.special_tokens,
        cl100k_base.pat_str
    )

    output_tokens = encoding.encode(output_message.content).length
    input_messages.forEach(message => input_tokens += encoding.encode(message.content).length)

    encoding.free()

    return json({ cached_tokens, input_tokens, output_tokens }, { status: 200 })
}
