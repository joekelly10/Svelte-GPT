export const getDateString = () => {
    const now     = new Date()
    const year    = now.getFullYear()
    const month   = String(now.getMonth() + 1).padStart(2,'0')
    const day     = String(now.getDate()).padStart(2,'0')
    const hours   = String(now.getHours()).padStart(2,'0')
    const minutes = String(now.getMinutes()).padStart(2,'0')
    const seconds = String(now.getSeconds()).padStart(2,'0')
  
    return `${year}-${month}-${day}@${hours}.${minutes}.${seconds}`
}

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
