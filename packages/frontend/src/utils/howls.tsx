import { queryOptions } from '@tanstack/react-query'
import client from '@/utils/client'


export const howlsQueryOptions = () =>
  queryOptions({
    queryKey: ['howls'],
    queryFn: () => client.howls.$get().then((r) => {
      console.log(r)
      return r.json()
    }),
  })