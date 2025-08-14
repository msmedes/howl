import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import z from 'zod'
import { db } from '@/db'
import { howls } from '@/db/schema'

const howlsRouter = new Hono()

howlsRouter.get('/', async (c) => {
  const howls = await db.query.howls.findMany({
    with: {
      user: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  })
  return c.json(howls)
})

howlsRouter.post('/', zValidator('json', z.object({
  content: z.string().min(1).max(140),
  userId: z.nanoid(),
})), async (c) => {
  const { content, userId } = c.req.valid('json')
  const howl = await db.insert(howls).values({ content, userId }).returning()
  return c.json(howl[0])
})

export default howlsRouter