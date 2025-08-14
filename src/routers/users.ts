import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import z from 'zod'
import { db } from '@/db'
import { users } from '@/db/schema'

const usersRouter = new Hono()

usersRouter.get('/:id',
  zValidator('param',
    z.object(
      {
        id: z.nanoid()
      }
    )
  ),
  async (c) => {
    const { id } = c.req.valid('param')
    const user = await db.query.users.findFirst({ where: eq(users.id, id) })
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    return c.json(user)
  })

export default usersRouter;