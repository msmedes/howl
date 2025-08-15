import { queryOptions } from '@tanstack/react-query'
import axios from 'redaxios'

import { env } from '@/env'

export const howlsQueryOptions = () =>
  queryOptions({
    queryKey: ['howls'],
    queryFn: () => axios.get(env.VITE_API_BASE + '/howls').then((r) => r.data),
  })