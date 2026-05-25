import { useQuery } from '@tanstack/react-query'
import { getPlanning, getPlanningStats } from '../api/planning'

export function usePlanningStats(params) {
  return useQuery({
    queryKey: ['planningStats', params],
    queryFn: () => getPlanningStats(params).then((r) => r.data),
    staleTime: 60_000,
  })
}

export function usePlanningList(params) {
  return useQuery({
    queryKey: ['planning', params],
    queryFn: () => getPlanning(params).then((r) => r.data),
    staleTime: 30_000,
  })
}
