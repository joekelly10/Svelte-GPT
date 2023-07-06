import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename  = fileURLToPath(import.meta.url)
const __dirname   = path.dirname(__filename)
const directories = __dirname.split('/')
const index       = directories.indexOf('server')

export const PROJECT_ROOT = directories.slice(0,index).join('/')
