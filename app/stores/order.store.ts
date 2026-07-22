import { defineStore } from 'pinia'
import type { IOrder } from '~/types'

export interface FetchOrdersParams {
    page?: number
    limit?: number
    status?: string
    ownerId?: string
    search?: string
    text?: string
}

export const useOrderStore = defineStore('order', () => {
    const orders = ref<IOrder[]>([])
    const currentOrder = ref<IOrder | null>(null)
    const isLoading = ref(false)
    const isLoadingMore = ref(false)
    const total = ref(0)
    const page = ref(1)
    const totalPages = ref(1)

    const hasMore = computed(() => page.value < totalPages.value)

    const fetchOrders = async (
        params: FetchOrdersParams = {},
        opts: { append?: boolean } = {}
    ) => {
        try {
            if (opts.append) isLoadingMore.value = true
            else isLoading.value = true

            const response = await useApi('/orders', {
                method: 'GET',
                params,
            })
            if (response.success) {
                const list: IOrder[] = response.data.orders ?? []
                if (opts.append) {
                    // Yangi orderlar tepaga qo'shilib ketishi mumkin — _id bo'yicha dublikatlarni oldini olamiz
                    const seen = new Set(orders.value.map((o) => o._id))
                    orders.value = [...orders.value, ...list.filter((o) => !seen.has(o._id))]
                } else {
                    orders.value = list
                }
                total.value = response.data.pagination?.total ?? orders.value.length
                page.value = response.data.pagination?.page ?? params.page ?? 1
                totalPages.value = response.data.pagination?.totalPages ?? 1
            }
            return response
        } catch (error) {
            console.error('FetchOrders error:', error)
            throw error
        } finally {
            isLoading.value = false
            isLoadingMore.value = false
        }
    }

    // Keyingi sahifani yuklab, mavjud ro'yxatga qo'shadi (infinite scroll)
    const loadMore = async (params: FetchOrdersParams = {}) => {
        if (isLoading.value || isLoadingMore.value || !hasMore.value) return
        return fetchOrders({ ...params, page: page.value + 1 }, { append: true })
    }

    const fetchOrderById = async (orderId: string) => {
        try {
            isLoading.value = true
            const response = await useApi(`/orders/${orderId}`)
            if (response.success) {
                currentOrder.value = response.data
            }
            return response
        } catch (error) {
            console.error('FetchOrderById error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    return {
        orders,
        currentOrder,
        isLoading,
        isLoadingMore,
        total,
        page,
        totalPages,
        hasMore,
        fetchOrders,
        loadMore,
        fetchOrderById,
    }
})
