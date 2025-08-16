import {hc} from 'hono/client'
import type {AppType} from '../../../../packages/server'
import {env} from '@/env'

const client = hc<AppType>(env.VITE_API_BASE)
export default client;