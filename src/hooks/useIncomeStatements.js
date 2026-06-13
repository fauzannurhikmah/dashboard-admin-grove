import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axiosClient from '../api/axiosClient'

export function useGetIncomeStatements(page = 1, pageSize = 20, keyword = '', period = '') {
    return useQuery({
        queryKey: ['admin-income-statements', page, pageSize, keyword, period],
        queryFn: async () => {
            const response = await axiosClient.get('/admin/income-statements', {
                params: {
                    page,
                    pageSize,
                    keyword: keyword || undefined,
                    period: period || undefined,
                },
            })
            return response.data
        },
        placeholderData: (previousData) => previousData,
        staleTime: 5 * 60 * 1000,
    })
}

export function useCreateIncomeStatement() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload) => {
            const response = await axiosClient.post('/admin/income-statements', payload)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-income-statements'] })
        },
    })
}

export function useUpdateIncomeStatement(id) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload) => {
            const response = await axiosClient.patch(`/admin/income-statements/${id}`, payload)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-income-statements'] })
            queryClient.invalidateQueries({ queryKey: ['admin-income-statements', id] })
        },
    })
}

export function useBatchUpdateIncomeStatement() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload) => {
            const response = await axiosClient.patch('/admin/income-statements/batch', payload)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-income-statements'] })
        },
    })
}

export function useGetIncomeStatementDetail(id) {
    return useQuery({
        queryKey: ['admin-income-statements', id],
        queryFn: async () => {
            const response = await axiosClient.get(`/admin/income-statements/${id}`)
            return response.data
        },
        enabled: !!id, // Hanya mengeksekusi fetch jika ID valid / tidak kosong
        staleTime: 5 * 60 * 1000,
    })
}