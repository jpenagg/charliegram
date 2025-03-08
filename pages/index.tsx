import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState, useRef, useCallback } from "react";
import { useSession } from 'next-auth/react';
import cloudinary from "../utils/cloudinary";
import Modal from "../components/Modal";
import Navbar from "../components/Navbar";
import type { ImageProps } from "../utils/types";
import { getBase64ImageUrl } from "../utils/getBase64Url";

export default function Home({ initialImages = [] }: { initialImages: ImageProps[] }) {
  const router = useRouter();
  const { photoId } = router.query;
  const [images, setImages] = useState(initialImages);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState("");
  const { data: session } = useSession();
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/images?cursor=${cursor}`);
      const data = await res.json();
      
      if (data.images?.length) {
        const existingIds = new Set(images.map(img => img.public_id));
        const newImages = data.images.filter(img => !existingIds.has(img.public_id));
        
        if (newImages.length > 0) {
          setImages(prev => [...prev, ...newImages]);
          setCursor(data.next_cursor || "");
        }
        
        if (newImages.length === 0 || !data.next_cursor) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more images:', error);
    }
    setLoading(false);
  }, [cursor, loading, hasMore, images]);

  const observerRef = useRef<IntersectionObserver>();
  const lastImageRef = useCallback((node: Element | null) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, loadMore]);

  const handleDelete = async (public_id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    setDeleting(public_id);
    try {
      const response = await fetch(`/api/delete-image?public_id=${encodeURIComponent(public_id)}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete image');

      setImages(prev => prev.filter(img => img.public_id !== public_id));
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <Head>
        <title>charliegram</title>
      </Head>

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-8">
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {images.map((image, index) => (
            <div
              key={image.public_id}
              ref={index === images.length - 1 ? lastImageRef : null}
              className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 cursor-pointer group shadow-sm hover:shadow-xl transition-shadow duration-500"
            >
              <Image
                src={`https://res.cloudinary.com/jpena/image/upload/v1/${image.public_id}.jpg`}
                alt="Photo of Charlie"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                priority={index < 4}
                placeholder="blur"
                blurDataURL={image.blurDataUrl}
                loading={index < 8 ? "eager" : "lazy"}
                onClick={() => router.push(`/?photoId=${image.public_id}`, undefined, { shallow: true })}
              />
              {session && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(image.public_id);
                    }}
                    disabled={deleting === image.public_id}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg"
                    aria-label="Delete image"
                  >
                    {deleting === image.public_id ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {loading && (
          <div className="mt-8 flex justify-center">
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
  try {
    const results = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'charliezard/',
      max_results: 12,
      sort_by: 'created_at',
      direction: 'desc'
    });

    const blurImagePromises = results.resources.map((image: ImageProps) => 
      getBase64ImageUrl(image)
    );
    const blurDataUrls = await Promise.all(blurImagePromises);

    const imagesWithBlur = results.resources.map((image: ImageProps, i: number) => ({
      ...image,
      blurDataUrl: blurDataUrls[i]
    }));

    return {
      props: {
        initialImages: imagesWithBlur
      },
      revalidate: 60
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      props: {
        initialImages: []
      }
    }
  }
}
