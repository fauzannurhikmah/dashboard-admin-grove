import { useQuery } from '@tanstack/react-query'
import axiosClient from '@/api/axiosClient'

export function useGetGroveFormulas() {
  return useQuery({
    queryKey: ['admin-grove-formulas'],
    queryFn: async () => {
      const response = await axiosClient.get('/admin/grove-formulas')
      return response.data
    },
    placeholderData: (previousData) => previousData,
    staleTime: 30000,
  })
}

export function useGetGroveFormulaDetail(formulaId) {
  return useQuery({
    queryKey: ['admin-grove-formulas', formulaId],
    queryFn: async () => {
      const response = await axiosClient.get(`/admin/grove-formulas/${formulaId}`)
      return response.data
    },
    enabled: !!formulaId,
    staleTime: 0,
  })
}
