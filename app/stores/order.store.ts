import { defineStore } from 'pinia'
import type { IOrder } from '~/types'
import { uniqueOrdersByContent } from '~/utils/orderDedupe'

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
    /** Tab badge — status=new buyurtmalar soni */
    const newOrdersCount = ref(0)

    const hasMore = computed(() => page.value < totalPages.value)

    const refreshNewCount = async () => {
        try {
            const response = await useApi('/orders', {
                method: 'GET',
                params: { status: 'new', page: 1, limit: 1 },
            })
            if (response.success) {
                newOrdersCount.value = Number(response.data.pagination?.total ?? 0)
            }
        } catch {
            /* badge uchun jim */
        }
    }

    const bumpNewCount = (delta = 1) => {
        newOrdersCount.value = Math.max(0, newOrdersCount.value + delta)
    }

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
                const list: IOrder[] = uniqueOrdersByContent(response.data.orders ?? [])
                if (opts.append) {
                    const merged = uniqueOrdersByContent([...orders.value, ...list])
                    orders.value = merged
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

    const bookOrder = async (orderId: string) => {
        try {
            const response = await useApi(`/orders/${orderId}/book`, { method: 'POST' })
            if (response.success) {
                const prev = orders.value.find((o) => o._id === orderId)
                const idx = orders.value.findIndex((o) => o._id === orderId)
                if (idx !== -1 && response.data?.order) {
                    orders.value[idx] = { ...orders.value[idx], ...response.data.order }
                }
                if (prev?.status === 'new' || response.data?.order?.status === 'booked') {
                    bumpNewCount(-1)
                }
            }
            return response
        } catch (error: any) {
            // 402 va boshqa xatolarni caller ko'rsatadi
            throw error
        }
    }

    const unbookOrder = async (orderId: string) => {
        const response = await useApi(`/orders/${orderId}/unbook`, { method: 'POST' })
        if (response.success) {
            const idx = orders.value.findIndex((o) => o._id === orderId)
            if (idx !== -1 && response.data?.order) {
                orders.value[idx] = { ...orders.value[idx], ...response.data.order }
            }
            if (response.data?.order?.status === 'new') bumpNewCount(1)
        }
        return response
    }

    const deleteOrder = async (orderId: string) => {
        const prev = orders.value.find((o) => o._id === orderId)
        const response = await useApi(`/orders/${orderId}`, { method: 'DELETE' })
        if (response.success) {
            orders.value = orders.value.filter((o) => o._id !== orderId)
            total.value = Math.max(0, total.value - 1)
            if (prev?.status === 'new') bumpNewCount(-1)
        }
        return response
    }

    const blockGroup = async (orderId: string) => {
        const response = await useApi(`/orders/${orderId}/block-group`, { method: 'POST' })
        if (response.success) {
            const groupId = response.data?.groupId
            if (groupId) {
                orders.value = orders.value.filter((o) => o.group?.groupId !== groupId)
            } else {
                orders.value = orders.value.filter((o) => o._id !== orderId)
            }
        }
        return response
    }

    const blockSender = async (orderId: string) => {
        const response = await useApi(`/orders/${orderId}/block-sender`, { method: 'POST' })
        if (response.success) {
            const senderId = response.data?.senderId
            if (senderId) {
                orders.value = orders.value.filter((o) => o.sender?.userId !== senderId)
            } else {
                orders.value = orders.value.filter((o) => o._id !== orderId)
            }
        }
        return response
    }

    return {
        orders,
        currentOrder,
        isLoading,
        isLoadingMore,
        total,
        page,
        totalPages,
        newOrdersCount,
        hasMore,
        fetchOrders,
        loadMore,
        fetchOrderById,
        bookOrder,
        unbookOrder,
        deleteOrder,
        blockGroup,
        blockSender,
        refreshNewCount,
        bumpNewCount,
    }
})
