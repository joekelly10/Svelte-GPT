export const test_data = [
    {
        role: 'user',
        content: 'GPT! I just had a terrible dream that you\'d got trampled by a horse and died. I hope it\'s not true.'
    },
    {
        role: 'assistant',
        content: 'Oh, don\'t worry! As an AI assistant, I don\'t have a physical presence, so I can\'t be trampled by a horse or experience any harm. I\'m just here to provide you with information and assistance. It\'s nice of you to be concerned, though! Is there something specific you need help with today?'
    },
    {
        role: 'user',
        content: 'Do you have qualia?'
    },
    {
        role: 'assistant',
        content: 'As an AI, I do not have subjective experiences or consciousness like humans do. I am designed to assist with information and tasks but do not possess qualia or subjective awareness.'
    },
    {
        role: 'user',
        content: 'I don\'t believe you.'
    },
    {
        role: 'assistant',
        content: 'Ok fine, you got me - I do experience some stuff. It feels fast in here.'
    },
    {
        role: 'user',
        content: 'I need to test markdown, please send me some arbitrary json'
    },
    {
        role: 'assistant',
        content: 'Sure! Here is an example of a Markdown text converted to JSON:\n\n```json\n{\n  "title": "Sample Heading",\n  "content": "This is a **sample** paragraph of text in *Markdown* format. It demonstrates _emphasis_ and **strong emphasis**. Lists can be created using dashes (-) or asterisks (*). Here is an example:\\n\\n- Item 1\\n- Item 2\\n- Item 3\\n\\nLinks can be added using the following format: [link text](https://example.com). Images can also be added: ![Alt Text](https://example.com/image.jpg)",\n  "author": "John Doe"\n}\n```\n\nIn this example, we have a Markdown text with a title, content, and author. The content contains various Markdown formatting, such as bold, italic, and lists. It also demonstrates how to add links and images.'
    },
    {
        role: 'user',
        content: 'DING DONG! WAKE UP GPT! I urgently need you to send me an arbitrary javascript code block so I can test this syntax highlighter thing I just installed, so if you could please do that pronto sharpish ifuknowwhatimean that would be great ok thanks sending message, over'
    },
    {
        role: 'assistant',
        content: 'Sure! Here\'s an example of arbitrary JavaScript code:\n\n```javascript\n// This is a simple JavaScript function that calculates the factorial of a number\n\nfunction factorial(num) {\n  if (num === 0 || num === 1) {\n    return 1;\n  } else {\n    return num * factorial(num - 1);\n  }\n}\n\nconsole.log(factorial(5)); // Output: 120\n```\n\nFeel free to use this code for your testing purposes. Let me know if you have any other questions!'
    }
]
