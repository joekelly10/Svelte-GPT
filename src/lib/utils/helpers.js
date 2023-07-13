export const isStreamedChatCompletion = (data) => {
    try {
        return typeof data === 'object' && data.choices[0].delta.content
    } catch {
        return false
    }
}

export const addCopyButtons = () => {
    const code_blocks = document.querySelectorAll('.message.assistant pre')

    code_blocks.forEach((block) => {
        let div = document.createElement('div')
        div.classList = 'copy-code'
        
        let button = document.createElement('button')
        button.classList = 'copy-code-button'
        button.innerText = 'Copy'

        block.appendChild(div)
        div.appendChild(button)

        button.addEventListener('click', async () => {
            clearTimeout(window.copy_code_timer)

            const code = block.querySelector('code').innerText
            await navigator.clipboard.writeText(code)

            button.innerText = 'Copied!'
            window.copy_code_timer = setTimeout(() => { button.innerText = 'Copy' }, 3000)
        })
    })
}

export const formatDate = (iso8601_string) => {
    const month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul','Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    const date     = new Date(iso8601_string)
    const month    = month_names[date.getMonth()]
    const hours    = date.getHours() % 12 || 12
    const minutes  = String(date.getMinutes()).padStart(2,'0')
    const meridiem = date.getHours() < 12 ? 'am' : 'pm'
    
    return `${date.getDate()} ${month} ${date.getFullYear()} <span class='bull'>&bull;</span> ${hours}:${minutes}${meridiem}`
}

export const messageCount = (messages) => {
    return 0.5 * (messages.length - 1)
}
