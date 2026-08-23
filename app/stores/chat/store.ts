import { defineStore } from 'pinia'
import type { IChat, IChatMessage } from '~/types'
import { createConnectionActions } from './actions/connection'
import { createListActions } from './actions/list'
import { createLocalStateActions } from './actions/local-state'
import { createMessagingActions } from './actions/messaging'
import { createSocketActions } from './actions/socket'
import { clearMessagesCache } from './helpers/message-cache'
import { TAB_LIST_KEEP } from '~/utils/tabListMemory'
import type { ChatStoreRefs, ConnStatus, FetchChatsParams, PeerPresence } from './types'

export type { FetchChatsParams }

/**
 * Chat Pinia store — holat shu yerda; amallar actions/ va helpers/ da.
 * Public API o'zgarmaydi: useChatStore + FetchChatsParams.
 */
export const useChatStore = defineStore('chat', () => {
    const chats = ref<IChat[]>([])
    const currentChat = ref<IChat | null>(null)
    const messages = ref<IChatMessage[]>([])

    const isLoading = ref(false)
    const isLoadingMore = ref(false)
    const isLoadingMessages = ref(false)
    const isLoadingOlderMessages = ref(false)
    const isSending = ref(false)

    const total = ref(0)
    const page = ref(1)
    const totalPages = ref(1)
    const messagesPage = ref(1)
    const messagesTotalPages = ref(1)
    const messagesChatId = ref<string | null>(null)
    /** Chats ro'yxati scroll — profil/chatdan qaytganda tiklash */
    const chatsListScrollY = ref(0)

    /** Tab badge — joriy ro'yxatdagi unread */
    const unreadTotal = computed(() =>
        chats.value.reduce((sum, c) => sum + (Number(c.unreadCount) || 0), 0),
    )

    const connectionStatus = ref<ConnStatus>('idle')
    const connectionReason = ref('')
    const peerPresence = ref<PeerPresence | null>(null)
    const peerTypingChatId = ref<string | null>(null)

    const refs: ChatStoreRefs = {
        chats,
        currentChat,
        messages,
        isLoading,
        isLoadingMore,
        isLoadingMessages,
        isLoadingOlderMessages,
        isSending,
        total,
        page,
        totalPages,
        messagesPage,
        messagesTotalPages,
        messagesChatId,
        connectionStatus,
        connectionReason,
        peerPresence,
        peerTypingChatId,
    }

    const { patchChat, appendMessage } = createLocalStateActions(refs)
    const connection = createConnectionActions(refs)
    const list = createListActions(refs, patchChat)
    const messaging = createMessagingActions(refs, { patchChat, appendMessage })
    const socket = createSocketActions(refs, {
        appendMessage,
        handoffMediaTemp: messaging.handoffMediaTemp,
        markRead: list.markRead,
        clearTypingForChat: connection.clearTypingForChat,
    })

    /** Tabbar boshqa tabga o'tganda — to'liq tozalash (logout va h.k.) */
    const releaseTabMemory = () => {
        messages.value = []
        currentChat.value = null
        messagesChatId.value = null
        connection.resetConnection()
        list.resetMessagesPagination()
        clearMessagesCache()
        chatsListScrollY.value = 0
        chats.value = []
        total.value = 0
        page.value = 1
        totalPages.value = 1
        isLoading.value = false
        isLoadingMore.value = false
        isLoadingMessages.value = false
        isLoadingOlderMessages.value = false
    }

    /** Boshqa tabga o'tganda — birinchi N chat saqlanadi, ochiq chat sessiyasi tozalanadi */
    const trimChatsForTabSwitch = (keep = TAB_LIST_KEEP) => {
        const n = Math.max(1, keep)
        messages.value = []
        currentChat.value = null
        messagesChatId.value = null
        connection.resetConnection()
        list.resetMessagesPagination()
        clearMessagesCache()

        if (chats.value.length > n) {
            chats.value = chats.value.slice(0, n)
        }

        page.value = 1
        isLoading.value = false
        isLoadingMore.value = false
        isLoadingMessages.value = false
        isLoadingOlderMessages.value = false

        const approxRow = 72
        if (chatsListScrollY.value > n * approxRow) {
            chatsListScrollY.value = 0
        }
    }

    return {
        chats,
        currentChat,
        messages,
        isLoading,
        isLoadingMore,
        isLoadingMessages,
        isLoadingOlderMessages,
        isSending,
        total,
        page,
        totalPages,
        messagesPage,
        messagesTotalPages,
        messagesChatId,
        chatsListScrollY,
        hasMore: list.hasMore,
        hasMoreMessages: list.hasMoreMessages,
        unreadTotal,
        connectionStatus,
        connectionReason,
        peerPresence,
        peerTypingChatId,
        isPeerTyping: connection.isPeerTyping,
        connect: connection.connect,
        ensureTelegramReady: connection.ensureTelegramReady,
        primeFromChat: connection.primeFromChat,
        fetchPresence: connection.fetchPresence,
        resetConnection: connection.resetConnection,
        fetchChats: list.fetchChats,
        loadMoreChats: list.loadMoreChats,
        fetchMessages: list.fetchMessages,
        invalidateMessagesFetch: list.invalidateMessagesFetch,
        hydrateMessagesFromCache: list.hydrateMessagesFromCache,
        persistCurrentMessagesCache: list.persistCurrentMessagesCache,
        loadOlderMessages: list.loadOlderMessages,
        resetMessagesPagination: list.resetMessagesPagination,
        sendMessage: messaging.sendMessage,
        sendVoice: messaging.sendVoice,
        sendPhoto: messaging.sendPhoto,
        sendLocation: messaging.sendLocation,
        startChatFromOrder: list.startChatFromOrder,
        startChatWithOrderOwner: list.startChatWithOrderOwner,
        startChatWithUser: list.startChatWithUser,
        startChatWithBookedDriver: list.startChatWithBookedDriver,
        markRead: list.markRead,
        markAllRead: list.markAllRead,
        deleteChats: list.deleteChats,
        deleteMessages: list.deleteMessages,
        clearChatHistory: list.clearChatHistory,
        onNewMessage: socket.onNewMessage,
        onMessageUpdate: socket.onMessageUpdate,
        onChatUpdate: socket.onChatUpdate,
        onMessagesRead: socket.onMessagesRead,
        onMessagesDeleted: socket.onMessagesDeleted,
        onChatConnect: connection.onChatConnect,
        onPeerPresence: connection.onPeerPresence,
        onPeerTyping: connection.onPeerTyping,
        releaseTabMemory,
        trimChatsForTabSwitch,
    }
})
