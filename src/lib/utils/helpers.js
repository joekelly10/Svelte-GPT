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
    const date = new Date(iso8601_string)

    if (lessThan7DaysAgo(date)) return timeAgo(date)
    
    const month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul','Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month       = month_names[date.getMonth()]
    const hours       = date.getHours() % 12 || 12
    const minutes     = String(date.getMinutes()).padStart(2,'0')
    const meridiem    = date.getHours() < 12 ? 'am' : 'pm'
    
    return `${date.getDate()} ${month} ${date.getFullYear()} <span class='bull'>&bull;</span> ${hours}:${minutes}${meridiem}`
}

const lessThan7DaysAgo = (date) => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    return date.getTime() > sevenDaysAgo.getTime()
}

const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000)

    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
        { label: 'second', seconds: 1 }
    ]
    
    for (let i = 0; i < intervals.length; i++) {
        const interval = intervals[i]
        const count    = Math.floor(seconds / interval.seconds)
        
        if (count > 0) {
            if (interval.label === 'day') {
                const hours    = date.getHours() % 12 || 12
                const minutes  = String(date.getMinutes()).padStart(2,'0')
                const meridiem = date.getHours() < 12 ? 'am' : 'pm'

                return `${count} ${interval.label}${count > 1 ? 's' : ''} ago <span class='bull'>&bull;</span> ${hours}:${minutes}${meridiem}` 
            }

            return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`
        }
    }
    
    return 'Just now'
}

export const insert = (id, array) => {
    if (array.includes(id)) return
    const i = array.findIndex(el => el > id)
    if (i === -1) {
        array.push(id)
    } else {
        array.splice(i, 0, id)
    }
}
