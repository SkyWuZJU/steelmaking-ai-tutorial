// app/api/users/register.ts

import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUser } from '@/app/api/file/redis';
import { User } from '@/lib/types';
import bcrypt from 'bcrypt';

const INVITATION_CODES = ['pucheng']

export async function POST(req: NextRequest) {
  const { username, password, role, invitationCode } = await req.json();

  if (!INVITATION_CODES.includes(invitationCode)) {
    return NextResponse.json({ message: 'Invalid invitation code' }, { status: 400 });
  }

  const existingUser = await getUser(username);
  if (existingUser) {
    return NextResponse.json({ message: 'User already exists' }, { status: 400 });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser: User = { 
    userName: username, 
    role: role,
    passwordHash: passwordHash, 
    createdAt: new Date().toISOString(),
    invitationCode: invitationCode,
   };
  await createUser(newUser);
  return NextResponse.json({ message: 'User registered' }, { status: 201 });
}