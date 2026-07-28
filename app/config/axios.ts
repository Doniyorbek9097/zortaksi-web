import axios from "axios"

export const api = axios.create({
  timeout: 20000, // ⏳ timeout
  withCredentials: true,
})
