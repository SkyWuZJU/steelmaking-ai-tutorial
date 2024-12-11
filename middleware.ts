import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('authToken')?.value || '';
  console.debug('AUTH_TOKEN fetched in middleware:\n', token);

  try {
    if (!token) {
      return NextResponse.redirect(`${req.nextUrl.origin}/login`);
      // throw new Error('authToken not found');
    }

    const response = await fetch(`/api/users/verifyToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error('Invalid or expired authToken');
    }

    const data = await response.json();
    // Attach user info to the request (optional)
    // req['user'] = data.user;
    return NextResponse.next();
  } catch (error) {
    // Redirect to login page if token is invalid
    console.debug('Error in middleware:\n', error);
    return NextResponse.redirect(`${req.nextUrl.origin}/login`);
  }
}

export const config = {
  matcher: ['/search/:path*'], // TODO: 配置登陆后的用户查看哪些内容
};