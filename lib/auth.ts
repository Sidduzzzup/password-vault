import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

export interface JWTPayload {
  userId: string
  email: string
}

export function createToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (err) {
    return null
  }
}

export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = request.cookies.get('token')?.value
  
  if (!token) {
    return null
  }

  return verifyToken(token)
}
