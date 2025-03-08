import { useRouter } from 'next/router'
import Image from 'next/image'
import { useKeypress } from '../hooks/useKeypress'
import { useState } from 'react'
import type { ImageProps } from '../utils/types'

export default function Modal({ images }: { images: ImageProps[] }) {
  const router = useRouter()
  const { photoId } = router.query
  const [isLoading, setIsLoading] = useState(true)
  
  const currentImage = images.find(image => image.id.toString() === (Array.isArray(photoId) ? photoId[0] : photoId))
  
  useKeypress('Escape', () => {
    router.push('/', undefined, { shallow: true })
  })

  if (!currentImage) return null

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 p-4 flex items-center justify-center"
      onClick={() => router.push('/', undefined, { shallow: true })}
    >
      <div 
        className="relative max-w-7xl max-h-[90vh] w-full h-full"
        onClick={e => e.stopPropagation()}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse flex space-x-2">
              <div className="w-3 h-3 bg-white/50 rounded-full"></div>
              <div className="w-3 h-3 bg-white/50 rounded-full"></div>
              <div className="w-3 h-3 bg-white/50 rounded-full"></div>
            </div>
          </div>
        )}
        <Image
          src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_800,e_blur:150,q_auto:eco/${currentImage.public_id}.${currentImage.format}`}
          alt="Photo of Charlie (loading)"
          fill
          className="object-contain"
          sizes="90vw"
          priority
          quality={30}
          placeholder="blur"
          blurDataURL={currentImage.blurDataUrl}
        />
        <Image
          src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/q_auto:good/${currentImage.public_id}.${currentImage.format}`}
          alt="Photo of Charlie"
          fill
          className={`object-contain transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          sizes="90vw"
          quality={85}
          onLoadingComplete={() => setIsLoading(false)}
        />
        <button 
          className="absolute top-4 right-4 text-white hover:text-gray-300 font-mono text-xl"
          onClick={(e) => {
            e.stopPropagation()
            router.push('/', undefined, { shallow: true })
          }}
        >
          [ESC]
        </button>
      </div>
    </div>
  )
}
