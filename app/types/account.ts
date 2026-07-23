/**
 * Lokal (localStorage) account — har biri mustaqil login (o'z JWT tokeni bilan).
 * Ustiga bosilganda shu accountning tokeniga almashiladi.
 */
export interface ILocalAccount {
    userId: string
    token: string          // shu account uchun JWT (auth_token)
    firstName?: string
    lastName?: string
    username?: string
    phoneNumber?: string
    avatar?: string
    /** admin | driver — switch dan keyin to'g'ri home */
    role?: 'admin' | 'driver' | 'customer' | string
}
