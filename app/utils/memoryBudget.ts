/**
 * Ilova xotira (RAM) cheklovlari — barcha og'ir ro'yxatlar shu raqamlardan foydalanadi.
 * O'zgartirish kerak bo'lsa faqat shu faylni tahrirlang.
 */

/** Pastki tabbar orasida saqlanadigan ro'yxat elementlari (tab almashganda RAM) */
export const TAB_LIST_KEEP = 10

/** Infinite scroll — bir API so'rovda yuklanadigan elementlar */
export const LIST_PAGE_SIZE = 15

/** To'lovlar tarixi — sahifa hajmi */
export const PAYMENT_PAGE_SIZE = 15

/** Virtual scroll — taxminiy qator balandliklari (px, gap bilan) */
export const ORDER_ROW_HEIGHT = 148
export const ORDER_DIVIDER_HEIGHT = 44
export const CHAT_ROW_HEIGHT = 86
export const POST_GROUP_ROW_HEIGHT = 102
export const PAYMENT_ROW_HEIGHT = 68

/** Ochiq chatda xotirada saqlanadigan xabarlar soni (eski xabarlar kesiladi) */
export const MAX_OPEN_MESSAGES = 80

/** Xabar ochilganda oldindan yuklanadigan media (voice/photo) soni */
export const MEDIA_PREFETCH_BATCH = 8

/** Sessiya blob URL keshi — har bir rasm/audio uchun RAM */
export const MAX_MEDIA_BLOB_CACHE = 48

/** Buyurtmalar ro'yxati — infinite scroll dan keyin xotirada qoladi */
export const MAX_ORDERS_IN_MEMORY = 40

/** Ko'rilgan buyurtma ID lari keshi */
export const MAX_SEEN_ORDER_IDS = 200

/** Chat sahifasida bir vaqtda DOM da chiziladigan skeleton qatorlari */
export const CHAT_SKELETON_ROWS = 5

/** Composer ovoz yozish animatsiyasi — kam DOM tugun = kam GPU */
export const VOICE_WAVE_BARS = 8
