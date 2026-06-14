import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from '../api/axiosClient'

export function useGetListings(page = 1, pageSize = 20, keyword = '', sectorId = '') {
    return useQuery({
        queryKey: ['admin-listings', page, pageSize, keyword, sectorId],
        queryFn: async () => {
            const response = await axiosClient.get('/admin/listings', {
                params: {
                    page,
                    pageSize,
                    keyword: keyword || undefined,
                    sectorId: sectorId || undefined
                }
            })
            return response.data
        },
        placeholderData: (previousData) => previousData,
    })
}

export function useSyncStockPrice(id) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async () => {
            const response = await axiosClient.post(`/admin/listings/${id}/sync-price`)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-listings'] })
        }
    })
}