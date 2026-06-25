import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Send, Copy } from 'lucide-react'
import axiosClient from '@/api/axiosClient'
import { useFormStore } from '@/store/useFormStore'

export default function JsonEditorSidebar({ formKey, recordId }) {
    const queryClient = useQueryClient()
    const isEdit = !!recordId

    if (!formKey) return null

    const currentData = useFormStore((state) => state.getFormData(formKey))
    const updateGlobalStore = useFormStore((state) => state.updateFormData)
    const addArrayItem = useFormStore((state) => state.addArrayItem)
    const removeLastArrayItem = useFormStore((state) => state.removeLastArrayItem)
    const showToast = useFormStore((state) => state.showToast)

    const submitMutation = useMutation({
        mutationFn: async (payload) => {
            if (!formKey) {
                throw new Error('Missing active form key.')
            }

            if (formKey === 'balance-sheets') {
                const response = await axiosClient.post('/admin/balance-sheets/upsert', payload)
                return response.data
            }

            const endpoint = isEdit
                ? (Array.isArray(payload) && formKey === 'income-statements'
                    ? `/admin/${formKey}/batch`
                    : `/admin/${formKey}/${recordId}`)
                : `/admin/${formKey}`

            const method = isEdit ? 'patch' : 'post'
            const response = await axiosClient[method](endpoint, payload)
            return response.data
        },
        onSuccess: () => {
            if (formKey) {
                queryClient.invalidateQueries({ queryKey: [`admin-${formKey}`] })
            }
        }
    })

    const [jsonString, setJsonString] = useState('')

    useEffect(() => {
        setJsonString(JSON.stringify(currentData, null, 2))
    }, [currentData])

    const handleTextChange = (e) => {
        const value = e.target.value
        setJsonString(value)
        try {
            const parsed = JSON.parse(value)
            updateGlobalStore(formKey, parsed)
        } catch (err) { }
    }

    const handleCopyJson = async () => {
        try {
            await navigator.clipboard.writeText(jsonString)
            showToast('JSON text copied to clipboard.', 'success')
        } catch (err) {
            showToast('Failed to copy JSON text.', 'error')
        }
    }

    const handleJsonSubmit = () => {
        try {
            const payload = JSON.parse(jsonString)

            submitMutation.mutate(payload, {
                onSuccess: () => {
                    if (isEdit && Array.isArray(payload)) {
                        showToast('Batch array successfully updated via /batch endpoint.', 'success')
                    } else if (isEdit) {
                        showToast('Single statement object updated successfully.', 'success')
                    } else {
                        showToast('JSON Payload parsed and pushed to backend database successfully.', 'success')
                        updateGlobalStore(formKey, {})
                    }
                },
                onError: (err) => {
                    showToast(err.response?.data?.message || 'Request rejected by API.', 'error')
                }
            })
        } catch (err) {
            showToast('Syntax Error: Please fix your JSON structure before submitting.', 'error')
        }
    }

    const isPending = submitMutation.isPending

    return (
        <div className="w-[400px] h-full bg-[#09090b] border-l border-zinc-900 flex flex-col text-xs text-zinc-400">

            <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-[#0c0c0e]">
                <span className="font-semibold text-zinc-200 font-mono tracking-tight">Live JSON Editor</span>
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={handleCopyJson}
                        className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 flex items-center gap-1 transition-all"
                        title="Copy JSON to Clipboard"
                    >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleJsonSubmit}
                        disabled={isPending}
                        className="p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 flex items-center gap-1 transition-all font-semibold disabled:opacity-40"
                    >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isPending ? 'Pushing...' : 'Submit'}</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 font-mono overflow-hidden">
                <textarea
                    value={jsonString}
                    onChange={handleTextChange}
                    className="w-full h-full bg-transparent text-zinc-300 outline-none resize-none leading-relaxed font-mono focus:outline-none overflow-y-auto"
                    spellCheck="false"
                />
            </div>

            <div className="p-3 border-t border-zinc-900 bg-[#0c0c0e] flex items-center gap-2 justify-end">
                <button
                    type="button"
                    onClick={() => removeLastArrayItem(formKey)}
                    className="px-2.5 py-1.5 rounded-md bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-all"
                    title="Remove Last Array Node"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Item</span>
                </button>
                <button
                    type="button"
                    onClick={() => addArrayItem(formKey)}
                    className="px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 flex items-center gap-1 transition-all font-medium"
                    title="Clone Row Parameters"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Item</span>
                </button>
            </div>

        </div>
    )
}
