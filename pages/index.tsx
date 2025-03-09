import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState, useRef, useCallback, useEffect } from "react";
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
  const [message, setMessage] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc' | 'random'>('desc');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (router.query.message === 'logged_out') {
      setMessage('Successfully logged out');
      // Clear the message from the URL
      router.replace('/', undefined, { shallow: true });
      // Clear the message after 3 seconds
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [router.query.message, router]);

  const handleSortChange = async (newOrder: 'desc' | 'asc' | 'random') => {
    console.log('Sort order changed to:', newOrder);
    setSortOrder(newOrder);
    setIsDropdownOpen(false);
    setLoading(true);
    setCursor("");
    setHasMore(true);
    // Clear existing images immediately
    setImages([]);
    
    try {
      console.log('Fetching with sort:', newOrder);
      const res = await fetch(`/api/images?sort=${newOrder}`);
      const data = await res.json();
      console.log('Received data:', data);
      
      if (data.images?.length) {
        setImages(data.images);
        setCursor(data.next_cursor);
        setHasMore(!!data.next_cursor);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
    setLoading(false);
  };

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/images?cursor=${cursor}&sort=${sortOrder}`);
      const data = await res.json();
      
      if (data.images?.length) {
        setImages(prev => [...prev, ...data.images]);
        setCursor(data.next_cursor);
        setHasMore(!!data.next_cursor);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more images:', error);
    }
    setLoading(false);
  }, [cursor, loading, hasMore, sortOrder]);

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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Head>
        <title>charliegram</title>
      </Head>

      <Navbar />

      {message && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-800 text-white px-6 py-3 rounded-lg font-mono z-50 shadow-lg flex items-center gap-3">
          <span className="text-green-500">$</span> {message}
          <button 
            onClick={() => setMessage('')}
            className="ml-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Close message"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-8">
        <div className="flex justify-end mb-6 relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-mono text-sm flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-green-500">$</span>
            {sortOrder === 'desc' ? 'Newest First' : sortOrder === 'asc' ? 'Oldest First' : 'Random'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-10">
              <button
                onClick={() => handleSortChange('desc')}
                className="w-full px-4 py-2 text-left font-mono text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <span className="text-green-500">$</span> Newest First
              </button>
              <button
                onClick={() => handleSortChange('asc')}
                className="w-full px-4 py-2 text-left font-mono text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <span className="text-green-500">$</span> Oldest First
              </button>
              <button
                onClick={() => handleSortChange('random')}
                className="w-full px-4 py-2 text-left font-mono text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <span className="text-green-500">$</span> Random
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {images.map((image, index) => (
            <div
              key={image.public_id}
              ref={index === images.length - 1 ? lastImageRef : null}
              className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 cursor-pointer group shadow-sm hover:shadow-xl transition-shadow duration-500"
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
    </div>
  );
}

export async function getStaticProps() {
  try {
    const results = await cloudinary.search
      .expression('folder:charliezard/*')
      .sort_by('created_at', 'desc')
      .max_results(12)
      .execute();

    const blurImagePromises = results.resources.map((image: ImageProps) => 
      getBase64ImageUrl(image, true)
    );
    const blurDataUrls = await Promise.all(blurImagePromises);

    const imagesWithBlur = results.resources.map((image: ImageProps, i: number) => ({
      public_id: image.public_id,
      blurDataUrl: blurDataUrls[i],
      width: image.width,
      height: image.height
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
