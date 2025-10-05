import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import CryptoJS from 'crypto-js'

// Helper function to derive encryption key from user's auth
function getEncryptionKey(userId: string): string {
  const baseKey = process.env.ENCRYPTION_KEY || 'default-encryption-key'
  return CryptoJS.SHA256(userId + baseKey).toString()
}

// PUT - Update a specific vault item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    const { title, username, url, password, notes } = await request.json()

    if (!title || !password) {
      return NextResponse.json(
        { error: 'Title and password are required' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const vaultCollection = db.collection('vaultItems')

    // Verify the item belongs to the user
    const existingItem = await vaultCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(user.userId),
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found or unauthorized' },
        { status: 404 }
      )
    }

    // Encrypt the updated data
    const encryptionKey = getEncryptionKey(user.userId)
    const dataToEncrypt = JSON.stringify({
      title,
      username: username || '',
      url: url || '',
      password,
      notes: notes || '',
    })

    const encryptedData = CryptoJS.AES.encrypt(dataToEncrypt, encryptionKey).toString()

    const result = await vaultCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          encryptedData,
          updatedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Item updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('PUT vault item error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a specific vault item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    const db = await getDatabase()
    const vaultCollection = db.collection('vaultItems')

    const result = await vaultCollection.deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(user.userId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Item not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Item deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE vault item error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
