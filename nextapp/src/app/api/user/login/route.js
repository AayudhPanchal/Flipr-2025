import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import User from '@/models/user';
import dbConnect from '@/lib/db';

export async function POST(req) {
  await dbConnect();

  const { email, password } = await req.json(); // Parse the request body
  console.log(email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 400 });
    }
    // console.log(password);
    // console.log()
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 405 });
    }

    return NextResponse.json({ message: 'Login successful' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
