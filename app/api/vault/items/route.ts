import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import CryptoJS from 'crypto-js'

// Helper function to derive encryption key from user's auth
function getEncryptionKey(userId: string): string {
  // In production, you might want to use a more secure key derivation
  const baseKey = process.env.ENCRYPTION_KEY || 'default-encryption-key'
  return CryptoJS.SHA256(userId + baseKey).toString()
}

// GET - Fetch all vault items for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const db = await getDatabase()
    const vaultCollection = db.collection('vaultItems')

    const items = await vaultCollection
      .find({ userId: new ObjectId(user.userId) })
      .sort({ createdAt: -1 })
      .toArray()

    // Decrypt items before sending to client
    const encryptionKey = getEncryptionKey(user.userId)
    const decryptedItems = items.map((item) => {
      try {
        if (item.encryptedData) {
          const decryptedBytes = CryptoJS.AES.decrypt(item.encryptedData, encryptionKey)
          const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8))
          
          return {
            _id: item._id.toString(),
            ...decryptedData,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }
        }
        return item
      } catch (err) {
        console.error('Decryption error for item:', item._id, err)
        return null
      }
    }).filter(item => item !== null)

    return NextResponse.json({ items: decryptedItems }, { status: 200 })
  } catch (error) {
    console.error('GET vault items error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new vault item
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, username, url, password, notes } = await request.json()

    if (!title || !password) {
      return NextResponse.json(
        { error: 'Title and password are required' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const vaultCollection = db.collection('vaultItems')

    // Encrypt the sensitive data
    const encryptionKey = getEncryptionKey(user.userId)
    const dataToEncrypt = JSON.stringify({
      title,
      username: username || '',
      url: url || '',
      password,
      notes: notes || '',
    })

    const encryptedData = CryptoJS.AES.encrypt(dataToEncrypt, encryptionKey).toString()

    const result = await vaultCollection.insertOne({
      userId: new ObjectId(user.userId),
      encryptedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json(
      { 
        message: 'Item created successfully',
        itemId: result.insertedId 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST vault item error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
