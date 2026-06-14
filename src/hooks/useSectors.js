import { useQuery } from '@tanstack/react-query'
import axiosClient from '../api/axiosClient'

export function useGetSectors() {
    return useQuery({
        queryKey: ['admin-sectors'],
        queryFn: async () => {
            const response = await axiosClient.get('/admin/sectors')
            return response.data
        },
        staleTime: 10 * 60 * 1000,
    })
}