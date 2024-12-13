import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function POST(req: NextRequest) {
  try {
    const { authToken } = await req.json().catch(() => ({ authToken: null }))
    const token = authToken || req.cookies.get('authToken')?.value
    console.debug('AUTH_TOKEN fetched in verifyToken:\n', token)

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 })
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: 'JWT_SECRET is not defined' },
        { status: 500 }
      )
    }

    const encoder = new TextEncoder()
    const secretKey = encoder.encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secretKey)
    return NextResponse.json({ data: payload })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }
}
