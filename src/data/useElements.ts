import { useQuery } from '@tanstack/react-query'
import { fetchElements } from './fetchElements'

export function useElements() {
  return useQuery({
    queryKey: ['elements'],
    queryFn: () => fetchElements(),
    staleTime: 24 * 60 * 60 * 1000,  // 24h — data rarely changes
  })
}
