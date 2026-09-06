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
import { lastMessagePreview } from '../helpers/message-preview'
import { messageReplyPreview } from '~/utils/messageReplyPreview'
import { inferTextFormat } from '~/utils/telegramHtml'
import type { ChatStoreRefs } from '../types'

/** Server javobi / xatodan tushunarli xato matni olish */
function getSendErrorText(res: any): string {
    const dataErr = String(res?.data?.error || '').trim()
    if (dataErr) return dataErr
    const msg = String(res?.message || res?.errorMessage || '').trim()
    if (msg) return msg
    if (res?.response?.data?.message) return String(res.response.data.message)
    return 'Xabar yetib bormadi'
}

/** Matn / ovoz / rasm yuborish va temp→real media almashtirish */
export function createMessagingActions(
    refs: ChatStoreRefs,
    deps: {
        patchChat: (chatId: string, patch: Partial<IChat>) => void
        appendMessage: (msg: IChatMessage) => void
        onProxyRequired?: (chatId: string, reason?: string) => void
    },
) {
    const { messages, isSending, messagesChatId } = refs
    const { patchChat, appendMessage, onProxyRequired } = deps

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
    const sendMessage = async (
        chatId: string,
        text: string,
        replyToMessageId?: string,
    ) => {
        const tempId = createTempId()
        const temp = createTempTextMessage(chatId, text, tempId)
        if (messagesChatId.value !== chatId) {
            messagesChatId.value = chatId
        }
        if (replyToMessageId) {
            const ref = messages.value.find((m) => String(m._id) === String(replyToMessageId))
            if (ref) {
                ;(temp as any).replyTo = {
                    messageId: String(ref._id),
                    text: messageReplyPreview(ref),
                    type: ref.type,
                    direction: ref.direction,
                }
            }
        }
        messages.value.push(temp)

        try {
            isSending.value = true
            const res = await useApi(`/chats/${chatId}/messages`, {
                method: 'POST',
                body: {
                    text,
                    ...(replyToMessageId ? { replyToMessageId } : {}),
                },
            })
            if (res.success) {
                // Temp bubble'ni serverdagi haqiqiy xabar (sent/failed) bilan almashtiramiz.
                // Socket orqali shu xabar allaqachon kelib qolgan bo'lishi mumkin — dublikat qilmaymiz.
                const real = {
                    ...res.data,
                    textFormat: inferTextFormat(res.data.text || '', res.data.textFormat),
                } as IChatMessage
                const result = replaceTempWithReal(messages.value, tempId, real)
                if (result === 'missing' && !messages.value.some((m) => m._id === real._id)) {
                    appendMessage(real)
                }
                patchChat(chatId, {
                    lastMessage: lastMessagePreview(real),
                    lastMessageAt: real.date,
                })
                if ((real as any).proxyRequired) {
                    onProxyRequired?.(chatId, String((real as any).error || ''))
                }
            } else {
                const idx = messages.value.findIndex((m) => m._id === tempId)
                if (idx !== -1) {
                    const errText = getSendErrorText(res)
                    messages.value[idx] = markTempFailed(temp, errText)
                }
            }
            return res
        } catch (error: any) {
            const idx = messages.value.findIndex((m) => m._id === tempId)
            if (idx !== -1) {
                messages.value[idx] = markTempFailed(temp, getSendErrorText(error))
            }
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

        const { setLocalUrl } = useChatMedia()
        if (import.meta.client) setLocalUrl(tempId, blob)

        messages.value.push(temp)

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
                if (idx !== -1) messages.value[idx] = markTempFailed(temp, getSendErrorText(res))
                console.error('sendVoice failed:', res.message || res)
            }
            return res
        } catch (error: any) {
            const idx = messages.value.findIndex((m) => m._id === tempId)
            if (idx !== -1) messages.value[idx] = markTempFailed(temp, getSendErrorText(error))
            console.error('sendVoice error:', error?.response?.data?.message || error?.message || error)
            throw error
        } finally {
            isSending.value = false
        }
    }

    /** Rasm yuborish */
    const sendPhoto = async (chatId: string, file: File, caption = '') => {
        const tempId = createTempId()
        const temp = createTempPhotoMessage(chatId, caption, tempId)

        const { setLocalUrl } = useChatMedia()
        if (import.meta.client) setLocalUrl(tempId, file)

        messages.value.push(temp)

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
                if (idx !== -1) messages.value[idx] = markTempFailed(temp, getSendErrorText(res))
                console.error('sendPhoto failed:', res.message || res)
            }
            return res
        } catch (error: any) {
            const idx = messages.value.findIndex((m) => m._id === tempId)
            if (idx !== -1) messages.value[idx] = markTempFailed(temp, getSendErrorText(error))
            console.error('sendPhoto error:', error?.response?.data?.message || error?.message || error)
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
                if (idx !== -1) messages.value[idx] = markTempFailed(temp, getSendErrorText(res))
            }
            return res
        } catch (error) {
            const idx = messages.value.findIndex((m) => m._id === tempId)
            if (idx !== -1) messages.value[idx] = markTempFailed(temp, getSendErrorText(error))
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
