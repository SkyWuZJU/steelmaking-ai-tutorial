// app/api/users/logout.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.set('authToken', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
  return response;
}