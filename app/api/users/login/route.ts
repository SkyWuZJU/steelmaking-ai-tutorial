import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/app/api/file/redis';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const user = await getUser(username);

  if (user && (await bcrypt.compare(password, user.passwordHash))) {
    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    const token = jwt.sign({ userName: user.userName }, process.env.JWT_SECRET, {
      expiresIn: '7d', // Token expires in 7 days
    });

    // Set the token in an HTTP-only cookie
    const response = NextResponse.json({ message: 'Login successful' });
    response.cookies.set('authToken', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    return response;
  } else {
    return NextResponse.json({ message: '用户名或密码错误' }, { status: 401 });
  }
}