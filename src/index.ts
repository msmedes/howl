import { Hono } from 'hono'
import usersRouter from '@/routers/users'
import howlsRouter from './routers/howls'


const app = new Hono()


app.route('/users', usersRouter)
app.route('/howls', howlsRouter)

export default { port: 3001, fetch: app.fetch }
