import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export async function getUserIdFromToken() {
  const cookieStore = cookies()
  const token = cookieStore.get('authToken')?.value
  if (!token || !process.env.JWT_SECRET) return null

  const secretKey = new TextEncoder().encode(process.env.JWT_SECRET)
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload.userName as string
  } catch (error) {
    return null
  }
}
