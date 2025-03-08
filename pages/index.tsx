import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from 'next/router'
import { useEffect, useState, useRef, useCallback } from 'react'
import cloudinary from "../utils/cloudinary"
import type { ImageProps } from "../utils/types"
import Modal from "../components/Modal"
import { getBase64ImageUrl } from "../utils/getBase64Url";

export default function Home({ initialImages, totalImages }: { initialImages: ImageProps[], totalImages: number }) {
  const router = useRouter()
  const { photoId } = router.query
  const [images, setImages] = useState(initialImages)
  const [loading, setLoading] = useState(false)
  const [cursor, setCursor] = useState('')
  const [hasMore, setHasMore] = useState(true)
  const loadMoreRef = useRef(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true)
    try {
      const res = await fetch(`/api/images?cursor=${cursor}`)
      const data = await res.json()
      
      if (data.images?.length) {
        setImages(prev => [...prev, ...data.images])
        setCursor(data.next_cursor || '')
        setHasMore(!!data.next_cursor)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more images:', error)
    }
    setLoading(false)
  }, [cursor, loading, hasMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [loadMore, hasMore])

  return (
    <>
      <Head>
        <title>charliegram</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content="A beautiful photo gallery" />
      </Head>
      <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 auto-rows-[300px]">
          {images.map((image) => (
            <Link
              key={image.id}
              href={`/?photoId=${image.id}`}
              as={`/p/${image.id}`}
              className="relative block overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 hover:shadow-xl transition-shadow"
            >
              <Image
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,g_auto,h_600,w_450,q_auto:good,f_auto/${image.public_id}.${image.format}`}
                alt="Photo of Charlie"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
                placeholder="blur"
                blurDataURL={image.blurDataUrl}
                priority={image.id < 4}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
              />
            </Link>
          ))}
        </div>
        
        {hasMore && (
          <div 
            ref={loadMoreRef} 
            className="mt-8 flex justify-center"
          >
            <div className="animate-pulse flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
            </div>
          </div>
        )}
        
        {photoId && <Modal images={images} />}
      </main>
    </>
  );
}

export async function getStaticProps() {
  const results = await cloudinary.v2.search
    .expression('folder:charliezard/*')
    .sort_by('public_id', 'desc')
    .max_results(12)
    .execute()

  let reducedImages: ImageProps[] = []

  for (let result of results.resources) {
    reducedImages.push({
      id: result.asset_id,
      height: result.height,
      width: result.width,
      image: result.secure_url,
      public_id: result.public_id,
      format: result.format
    })
  }

  const blurImagePromises = results.resources.map((image: ImageProps) => {
    return getBase64ImageUrl(image)
  })
  
  const imagesWithBlurDataUrls = await Promise.all(blurImagePromises)

  for (let i = 0; i < reducedImages.length; i++) {
    reducedImages[i].blurDataUrl = imagesWithBlurDataUrls[i]
  }

  return {
    props: {
      initialImages: reducedImages,
      totalImages: results.total_count,
    },
    revalidate: 60
  }
}
