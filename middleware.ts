import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('authToken')?.value || ''

  try {
    if (!token) {
      return NextResponse.redirect(`${req.nextUrl.origin}/login`)
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined')
    }

    const encoder = new TextEncoder()
    const secretKey = encoder.encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secretKey)
    const userRole = payload.userRole

    // Block access to '/knowledge' if user is not an admin
    if (req.nextUrl.pathname.startsWith('/knowledge') && userRole !== 'admin') {
      return NextResponse.redirect(`${req.nextUrl.origin}/login`)
    }

    // Optionally attach user info to the request
    // req['user'] = payload
    return NextResponse.next()
  } catch (error) {
    console.debug('Error in middleware:\n', error)
    return NextResponse.redirect(`${req.nextUrl.origin}/login`)
  }
}

export const config = {
  matcher: ['/search/:path*', '/knowledge']
}
