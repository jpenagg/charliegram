import { Dialog } from "@headlessui/react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useKeypress } from '../hooks/useKeypress';
import { useState, useCallback, useEffect } from 'react';
import type { ImageProps } from '../utils/types'
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function Modal({ images }: { images: ImageProps[] }) {
  const router = useRouter();
  const { photoId } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  
  const currentIndex = images.findIndex(img => img.public_id === photoId);
  const currentImage = images[currentIndex];

  const isFirstImage = currentIndex === 0;
  const isLastImage = currentIndex === images.length - 1;

  const closeModal = useCallback(() => {
    const path = router.pathname; // Get current page path
    router.push(path, undefined, { shallow: true });
  }, [router]);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev' && isFirstImage) return;
    if (direction === 'next' && isLastImage) return;
    
    const newIndex = direction === 'next' 
      ? currentIndex + 1
      : currentIndex - 1;
    
    const path = router.pathname; // Get current page path
    router.push(`${path}?photoId=${images[newIndex].public_id}`, undefined, { shallow: true });
  }, [currentIndex, images, router, isFirstImage, isLastImage]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight' && !isLastImage) navigate('next');
      if (e.key === 'ArrowLeft' && !isFirstImage) navigate('prev');
    }
    
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [closeModal, navigate, isFirstImage, isLastImage]);

  if (!currentImage) return null;

  return (
    <Dialog
      open={true}
      onClose={closeModal}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* Previous Button - Only show if not first image */}
        {!isFirstImage && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('prev');
            }}
            className="absolute left-8 top-1/2 -translate-y-1/2 text-white/75 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors z-50"
          >
            <ChevronLeftIcon className="w-8 h-8" />
          </button>
        )}

        {/* Next Button - Only show if not last image */}
        {!isLastImage && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('next');
            }}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-white/75 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors z-50"
          >
            <ChevronRightIcon className="w-8 h-8" />
          </button>
        )}

        <Dialog.Panel className="relative bg-black rounded-lg overflow-hidden max-w-4xl mx-auto">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white/70 text-sm z-10 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          
          <div className="relative">
            {/* Low quality placeholder */}
            <Image
              src={`https://res.cloudinary.com/jpena/image/upload/e_blur:1000,q_1,f_auto/${currentImage.public_id}.jpg`}
              alt="Photo of Charlie (loading)"
              width={800}
              height={600}
              className={`object-contain ${!isLoading ? 'hidden' : ''}`}
              priority
            />
            
            {/* High quality image */}
            <Image
              src={`https://res.cloudinary.com/jpena/image/upload/v1/${currentImage.public_id}.jpg`}
              alt="Photo of Charlie"
              width={800}
              height={600}
              className={`object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              priority
              onLoadingComplete={() => setIsLoading(false)}
            />
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse flex space-x-2">
                  <div className="w-3 h-3 bg-white/50 rounded-full"></div>
                  <div className="w-3 h-3 bg-white/50 rounded-full"></div>
                  <div className="w-3 h-3 bg-white/50 rounded-full"></div>
                </div>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
