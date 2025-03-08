import { useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import Navbar from '../../components/Navbar'

export default function UploadPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'))
    setFiles(prev => [...prev, ...imageFiles])
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login?callbackUrl=/admin/upload')
    }
  }, [status, router])

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse flex space-x-2">
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render anything while redirecting
  if (!session) {
    return null
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...selectedFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    setUploading(true)
    setError('')

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) throw new Error('Upload failed')

        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 100
        }))
      }

      setFiles([])
      router.push('/')
    } catch (err) {
      setError('Failed to upload images. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Head>
        <title>Upload Photos - charliegram</title>
      </Head>

      <Navbar />

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 font-mono">
              {'>'} upload_photos_
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-mono">
              <span className="text-green-500">$</span> drag and drop images or click to select
            </p>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer font-mono text-gray-600 dark:text-gray-400"
            >
              {isDragging ? '> releasing_to_upload...' : '> select_or_drop_files_here'}
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-8 space-y-4">
              <div className="font-mono text-sm text-gray-600 dark:text-gray-400">
                <span className="text-green-500">$</span> files_ready_to_upload: {files.length}
              </div>
              <div className="grid grid-cols-3 gap-2 w-full">
                {files.map((file, index) => (
                  <div key={index} className="relative group w-full">
                    <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="sr-only">Remove</span>
                      ✕
                    </button>
                    {uploadProgress[file.name] && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white font-mono">
                          {uploadProgress[file.name]}%
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {error && (
                <div className="text-red-500 font-mono text-sm">
                  <span className="text-red-500">!</span> {error}
                </div>
              )}
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white rounded font-mono transition-colors"
              >
                {uploading ? '$ uploading...' : '$ upload_files'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 