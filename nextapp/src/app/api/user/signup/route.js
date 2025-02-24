import { NextResponse } from 'next/server';
import dbConnect from "@/lib/db";
import bcrypt from "bcryptjs";
import User from "@/models/user";

export async function POST(req) {
  const { name, email, phoneNumber, password, confirmPassword, address } = await req.json();

  if (!name || !email || !phoneNumber || !password || !confirmPassword || !address) {
    return NextResponse.json({ message: "All fields are required" }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ message: "Passwords do not match" }, { status: 400 });
  }

  await dbConnect();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ message: "User already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name,
    email,
    phoneNumber,
    password: hashedPassword,
    confirmPassword: hashedPassword,
    address,
  });

  await newUser.save();

  return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
}
