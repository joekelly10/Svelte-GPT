export const addCopyButtons = () => {
    const code_blocks = document.querySelectorAll('.message pre')

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

export const getCost = (model_id, usage) => {
    let input_cost  = 0,
        output_cost = 0
    
    const aliases = new Map([
        ['gpt-4o-2024-08-06', 'gpt-4o'],
        ['claude-3-haiku-20240307', 'claude-3-haiku'],
        ['claude-3-5-sonnet-20240620', 'claude-3-5-sonnet'],
        ['claude-3-opus-20240229', 'claude-3-opus'],
        ['command-r-plus-08-2024', 'command-r-plus'],
        ['llama3.2-11b-vision', 'llama-3-light'],
        ['llama3.2-90b-vision', 'llama-3-medium'],
        ['llama3.1-405b', 'llama-3-heavy']
    ])

    model_id = aliases.get(model_id) ?? model_id

    const model_prices = [
        {
            id: 'gpt-4o-mini',
            price: {
                cents: {
                    input_token:  15/1000000, // $0.15/mTok
                    output_token: 60/1000000
                }
            }
        },
        {
            id: 'gpt-4o',
            price: {
                cents: {
                    input_token:  250/1000000, // $2.50/mTok
                    output_token: 1000/1000000
                }
            }
        },
        {
            id: 'claude-3-haiku',
            price: {
                cents: {
                    input_token:  25/1000000, // $0.25/mTok
                    output_token: 125/1000000
                }
            }
        },
        {
            id: 'claude-3-5-sonnet',
            price: {
                cents: {
                    input_token:  300/1000000, // $3.00/mTok
                    output_token: 1500/1000000
                }
            }
        },
        {
            id: 'claude-3-opus',
            price: {
                cents: {
                    input_token:  1500/1000000, // $15.00/mTok
                    output_token: 7500/1000000
                }
            }
        },
        {
            id: 'gemini-1.5-flash',
            price: {
                cents: {
                    input_token:  75/10000000, // $0.075/mTok
                    output_token: 30/1000000   // $0.30/mTok
                }
            }
        },
        {
            id: 'gemini-1.5-pro',
            price: {
                cents: {
                    input_token:  125/1000000, // $1.25/mTok
                    output_token: 500/1000000
                }
            }
        },
        {
            id: 'command-r',
            price: {
                cents: {
                    input_token:  15/1000000, // $0.15/mTok
                    output_token: 60/1000000
                }
            }
        },
        {
            id: 'command-r-plus',
            price: {
                cents: {
                    input_token:  250/1000000, // $2.50/mTok
                    output_token: 1000/1000000
                }
            }
        },
        {
            id: 'llama-3-light',
            price: {
                cents: {
                    input_token:  40/1000000, // $0.40/mTok
                    output_token: 40/1000000
                }
            }
        },
        {
            id: 'llama-3-medium',
            price: {
                cents: {
                    input_token:  280/1000000, // $2.80/mTok
                    output_token: 280/1000000
                }
            }
        },
        {
            id: 'llama-3-heavy',
            price: {
                cents: {
                    input_token:  320/1000000, // $3.20/mTok
                    output_token: 320/1000000
                }
            }
        }
    ]

    const price = model_prices.find(m => m.id === model_id).price

    input_cost  = usage.input_tokens * price.cents.input_token
    output_cost = usage.output_tokens * price.cents.output_token

    return {
        input:  input_cost,
        output: output_cost,
        total:  input_cost + output_cost
    }
}
