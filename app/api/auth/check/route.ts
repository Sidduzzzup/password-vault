import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }

  return NextResponse.json(
    { 
      authenticated: true,
      user: {
        userId: user.userId,
        email: user.email,
      }
    },
    { status: 200 }
  )
}
