import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useRef, useCallback } from "react";
import cloudinary from "../utils/cloudinary";
import Modal from "../components/Modal";
import Navbar from "../components/Navbar";
import type { ImageProps } from "../utils/types";
import { getBase64ImageUrl } from "../utils/getBase64Url";
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Home({ initialImages = [] }: { initialImages: ImageProps[] }) {
  const router = useRouter();
  const { photoId } = router.query;
  const [images, setImages] = useState(initialImages);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState("");
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/images?cursor=${cursor}`);
      const data = await res.json();
      
      if (data.images?.length) {
        setImages(prev => [...prev, ...data.images]);
        if (data.next_cursor) {
          setCursor(data.next_cursor);
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more images:', error);
    }
    setLoading(false);
  }, [cursor, loading, hasMore]);

  // Intersection Observer for infinite scroll
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
              onClick={() => router.push(`/?photoId=${image.public_id}`, undefined, { shallow: true })}
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
              />
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

    // Generate blur placeholder for each image
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
