import { useQuery } from '@tanstack/react-query'
import { countNewAlerts } from '../api/alerts'

export function useAlertCount() {
  return useQuery({
    queryKey: ['alertCount'],
    queryFn: () => countNewAlerts().then((r) => r.data.count),
    refetchInterval: 60_000,
  })
}
