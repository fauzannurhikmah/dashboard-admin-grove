import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from '../api/axiosClient'

export function useGetCashFlows(page = 1, pageSize = 20, keyword = '', period = '', sectorId = '') {
    return useQuery({
        queryKey: ['admin-cash-flows', page, pageSize, keyword, period, sectorId],
        queryFn: async () => {
            const response = await axiosClient.get('/admin/cash-flow-statements', {
                params: {
                    page,
                    pageSize,
                    keyword: keyword || undefined,
                    period: period || undefined,
                    sectorId: sectorId || undefined
                }
            })
            return response.data
        },
        placeholderData: (previousData) => previousData,
    })
}

export function useGetCashFlowDetail(id) {
    return useQuery({
        queryKey: ['admin-cash-flows', id],
        queryFn: async () => {
            const response = await axiosClient.get(`/admin/cash-flow-statements/${id}`)
            return response.data
        },
        enabled: !!id,
        staleTime: 0,
    })
}

export function useUpsertCashFlow() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload) => {
            const response = await axiosClient.post('/admin/cash-flow-statements/upsert', payload)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-cash-flows'] })
        }
    })
}