'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CryptoJS from 'crypto-js'

interface VaultItem {
  _id: string
  title: string
  username: string
  url: string
  password: string
  notes: string
  encryptedData: string
}

export default function VaultPage() {
  const router = useRouter()
  const [items, setItems] = useState<VaultItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    username: '',
    url: '',
    password: '',
    notes: '',
  })

  // Check authentication and load items
  useEffect(() => {
    checkAuthAndLoadItems()
  }, [])

  // Pre-fill password from generator if available
  useEffect(() => {
    const generatedPassword = sessionStorage.getItem('generatedPassword')
    if (generatedPassword) {
      setFormData(prev => ({ ...prev, password: generatedPassword }))
      setShowModal(true)
      sessionStorage.removeItem('generatedPassword')
    }
  }, [])

  const checkAuthAndLoadItems = async () => {
    try {
      const authRes = await fetch('/api/auth/check')
      const authData = await authRes.json()
      
      if (!authData.authenticated) {
        window.location.href = '/login'
        return
      }

      await loadItems()
    } catch (err) {
      console.error('Auth check failed:', err)
      window.location.href = '/login'
    }
  }

  const loadItems = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/vault/items')
      
      if (!res.ok) {
        throw new Error('Failed to load items')
      }

      const data = await res.json()
      setItems(data.items || [])
    } catch (err) {
      console.error('Failed to load items:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  const openModal = (item?: VaultItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        title: item.title,
        username: item.username,
        url: item.url,
        password: item.password,
        notes: item.notes,
      })
    } else {
      setEditingItem(null)
      setFormData({
        title: '',
        username: '',
        url: '',
        password: '',
        notes: '',
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setFormData({
      title: '',
      username: '',
      url: '',
      password: '',
      notes: '',
    })
  }

  const handleSave = async () => {
    try {
      const url = editingItem 
        ? `/api/vault/items/${editingItem._id}`
        : '/api/vault/items'
      
      const method = editingItem ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error('Failed to save item')
      }

      await loadItems()
      closeModal()
    } catch (err) {
      console.error('Failed to save:', err)
      alert('Failed to save item')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      const res = await fetch(`/api/vault/items/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete item')
      }

      await loadItems()
    } catch (err) {
      console.error('Failed to delete:', err)
      alert('Failed to delete item')
    }
  }

  const copyPassword = async (password: string, id: string) => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(id)
      
      // Clear clipboard after 15 seconds
      setTimeout(async () => {
        await navigator.clipboard.writeText('')
        setCopied(null)
      }, 15000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🔐 My Vault</h1>
              <p className="text-sm text-gray-600">Secure password storage</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition"
              >
                Generator
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Search and Add Button */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search vault items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium whitespace-nowrap"
          >
            + Add New Item
          </button>
        </div>

        {/* Items List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading your vault...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg mb-2">
              {searchQuery ? 'No items found' : 'Your vault is empty'}
            </p>
            <p className="text-gray-500 text-sm">
              {searchQuery ? 'Try a different search query' : 'Add your first password to get started'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {item.title}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      {item.username && (
                        <p>
                          <span className="font-medium">Username:</span> {item.username}
                        </p>
                      )}
                      {item.url && (
                        <p>
                          <span className="font-medium">URL:</span>{' '}
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {item.url}
                          </a>
                        </p>
                      )}
                      {item.notes && (
                        <p>
                          <span className="font-medium">Notes:</span> {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => copyPassword(item.password, item._id)}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                    >
                      {copied === item._id ? '✓ Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => openModal(item)}
                      className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Gmail Account"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                >
                  {editingItem ? 'Update' : 'Save'}
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
