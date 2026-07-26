import type { IChat, IChatMessage } from '~/types'
import { voiceBlobExtension } from '~/utils/voiceRecording'
import {
    createTempId,
    createTempLocationMessage,
    createTempPhotoMessage,
    createTempTextMessage,
    createTempVoiceMessage,
    markTempFailed,
} from '../helpers/temp-message'
import { replaceTempWithReal } from '../helpers/merge-messages'
import type { ChatStoreRefs } from '../types'

/** Matn / ovoz / rasm yuborish va temp→real media almashtirish */
export function createMessagingActions(
    refs: ChatStoreRefs,
    deps: {
        patchChat: (chatId: string, patch: Partial<IChat>) => void
        appendMessage: (msg: IChatMessage) => void
    },
) {
    const { messages, isSending } = refs
    const { patchChat, appendMessage } = deps

    /** temp→real: mahalliy blob URL ni real id ga o'tkazish (splice dan oldin) */
    const handoffMediaTemp = (
        tempId: string,
        realId: string,
        kind: 'voice' | 'photo',
    ) => {
        if (!import.meta.client || !tempId || !realId) return
        const media = useChatMedia()
        media.adoptLocalUrl(tempId, realId)
        media.upgradeFromServer(realId, kind)
    }

    /** Chiquvchi media xabarni temp dan real id ga almashtirish */
    const replaceOutgoingMediaTemp = (
        tempId: string,
        real: IChatMessage,
        kind: 'voice' | 'photo',
    ) => {
        handoffMediaTemp(tempId, real._id, kind)
        const result = replaceTempWithReal(messages.value, tempId, real)
        if (result === 'missing' && !messages.value.some((m) => m._id === real._id)) {
            appendMessage(real)
        }
    }

    /**
     * Xabar yuborish — darhol "yuborilmoqda" bubble; server javobi kelgach
     * haqiqiy holat (sent/failed) bilan almashtiriladi.
     */
    const sendMessage = async (chatId: string, text: string) => {
        const tempId = createTempId()
        const temp = createTempTextMessage(chatId, text, tempId)
        messages.value.push(temp)

        try {
            isSending.value = true
            const res = await useApi(`/chats/${chatId}/messages`, {
                method: 'POST',
                body: { text },
            })
            if (res.success) {
                // Temp bubble'ni serverdagi haqiqiy xabar (sent/failed) bilan almashtiramiz.
                // Socket orqali shu xabar allaqachon kelib qolgan bo'lishi mumkin — dublikat qilmaymiz.
                const result = replaceTempWithReal(messages.value, tempId, res.data)
                if (result === 'missing' && !messages.value.some((m) => m._id === res.data._id)) {
                    appendMessage(res.data)
                }
                patchChat(chatId, { lastMessage: res.data.text, lastMessageAt: res.data.date })
            } else {
                const idx = messages.value.findIndex((m) => m._id === tempId)
                if (idx !== -1) messages.value[idx] = markTempFailed(temp)
            }
            return res
        } catch (error) {
            const idx = messages.value.findIndex((m) => m._id === tempId)
            if (idx !== -1) messages.value[idx] = markTempFailed(temp)
            console.error('sendMessage error:', error)
            throw error
        } finally {
            isSending.value = false
        }
    }

    /** Ovozli xabar yuborish */
    const sendVoice = async (chatId: string, blob: Blob, duration: number) => {
        const tempId = createTempId()
        const temp = createTempVoiceMessage(chatId, duration, tempId)
        messages.value.push(temp)

        const { setLocalUrl } = useChatMedia()
        if (import.meta.client) setLocalUrl(tempId, blob)

        try {
            isSending.value = true
            const form = new FormData()
            const ext = voiceBlobExtension(blob.type)
            form.append('file', blob, `voice.${ext}`)
            form.append('duration', String(Math.max(1, Math.round(duration))))

            const res = await useApi(`/chats/${chatId}/messages/voice`, {
                method: 'POST',
                body: form,
                timeout: 120000,
            })
            if (res.success) {
                replaceOutgoingMediaTemp(tempId, res.data, 'voice')
                patchChat(chatId, {
                    lastMessage: `🎤 Ovozli xabar (${res.data.duration || duration}s)`,
                    lastMessageAt: res.data.date,
                })
            } else {
                const idx = messages.value.findIndex((m) => m._id === tempId)
                if (idx !== -1) messages.value[idx] = markTempFailed(temp)
            }
            return res
        } catch (error) {
            const idx = messages.value.findIndex((m) => m._id === tempId)
            if (idx !== -1) messages.value[idx] = markTempFailed(temp)
            console.error('sendVoice error:', error)
            throw error
        } finally {
            isSending.value = false
        }
    }

    /** Rasm yuborish */
    const sendPhoto = async (chatId: string, file: File, caption = '') => {
        const tempId = createTempId()
        const temp = createTempPhotoMessage(chatId, caption, tempId)
        messages.value.push(temp)

        const { setLocalUrl } = useChatMedia()
        if (import.meta.client) setLocalUrl(tempId, file)

        try {
            isSending.value = true
            const form = new FormData()
            form.append('file', file, file.name || 'photo.jpg')
            if (caption) form.append('caption', caption)

            const res = await useApi(`/chats/${chatId}/messages/photo`, {
                method: 'POST',
                body: form,
                timeout: 120000,
            })
            if (res.success) {
                replaceOutgoingMediaTemp(tempId, res.data, 'photo')
                patchChat(chatId, {
                    lastMessage: caption || '📷 Rasm',
                    lastMessageAt: res.data.date,
                })
            } else {
                const idx = messages.value.findIndex((m) => m._id === tempId)
                if (idx !== -1) messages.value[idx] = markTempFailed(temp)
            }
            return res
        } catch (error) {
            const idx = messages.value.findIndex((m) => m._id === tempId)
            if (idx !== -1) messages.value[idx] = markTempFailed(temp)
            console.error('sendPhoto error:', error)
            throw error
        } finally {
            isSending.value = false
        }
    }

    /** Joylashuv yuborish */
    const sendLocation = async (
        chatId: string,
        lat: number,
        lng: number,
        title?: string,
    ) => {
        const tempId = createTempId()
        const temp = createTempLocationMessage(chatId, lat, lng, tempId, title)
        messages.value.push(temp)

        try {
            isSending.value = true
            const res = await useApi(`/chats/${chatId}/messages/location`, {
                method: 'POST',
                body: { lat, lng, title },
            })
            if (res.success) {
                const result = replaceTempWithReal(messages.value, tempId, res.data)
                if (result === 'missing' && !messages.value.some((m) => m._id === res.data._id)) {
                    appendMessage(res.data)
                }
                patchChat(chatId, {
                    lastMessage: res.data.locationTitle || '📍 Joylashuv',
                    lastMessageAt: res.data.date,
                })
            } else {
                const idx = messages.value.findIndex((m) => m._id === tempId)
                if (idx !== -1) messages.value[idx] = markTempFailed(temp)
            }
            return res
        } catch (error) {
            const idx = messages.value.findIndex((m) => m._id === tempId)
            if (idx !== -1) messages.value[idx] = markTempFailed(temp)
            console.error('sendLocation error:', error)
            throw error
        } finally {
            isSending.value = false
        }
    }

    return {
        handoffMediaTemp,
        replaceOutgoingMediaTemp,
        sendMessage,
        sendVoice,
        sendPhoto,
        sendLocation,
    }
}
