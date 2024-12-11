import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('authToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 })
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: 'JWT_SECRET is not defined' },
        { status: 500 }
      )
    }

    const data = jwt.verify(token, process.env.JWT_SECRET)
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }
}
