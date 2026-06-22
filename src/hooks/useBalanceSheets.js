import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from '../api/axiosClient'

export function useGetBalanceSheets(page = 1, pageSize = 20, keyword = '', period = '', sectorId = '') {
    return useQuery({
        queryKey: ['admin-balance-sheets', page, pageSize, keyword, period, sectorId],
        queryFn: async () => {
            const response = await axiosClient.get('/admin/balance-sheets', {
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

export function useGetBalanceSheetDetail(id) {
    return useQuery({
        queryKey: ['admin-balance-sheets', id],
        queryFn: async () => {
            const response = await axiosClient.get(`/admin/balance-sheets/${id}`)
            return response.data
        },
        enabled: !!id,
        staleTime: 0,
    })
}

export function useUpsertBalanceSheet() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload) => {
            const response = await axiosClient.post('/admin/balance-sheets/upsert', payload)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-balance-sheets'] })
        }
    })
}

export function useSyncBalanceSheets(listingId, sectorId) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async () => {
            const response = await axiosClient.post(
                '/admin/balance-sheets/sync',
                { listingId, sectorId },
                { timeout: 300000 }
            )
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-balance-sheets'] })
            queryClient.invalidateQueries({ queryKey: ['admin-listings'] })
        }
    })
}

export function useSyncBalanceSheetsBySector() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (sectorId) => {
            const response = await axiosClient.post(
                '/admin/balance-sheets/sync',
                { sectorId },
                { timeout: 3600000 }
            )
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-balance-sheets'] })
            queryClient.invalidateQueries({ queryKey: ['admin-listings'] })
        }
    })
}
