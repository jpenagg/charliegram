import { Dialog } from "@headlessui/react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useKeypress } from '../hooks/useKeypress';
import { useState } from 'react';
import type { ImageProps } from '../utils/types'

export default function Modal({ images }: { images: ImageProps[] }) {
  const router = useRouter();
  const { photoId } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  
  const currentImage = images.find(img => img.public_id === photoId);
  
  useKeypress('Escape', () => {
    router.push('/', undefined, { shallow: true });
  });

  const handleClose = () => router.push('/', undefined, { shallow: true });

  if (!currentImage) return null;

  return (
    <Dialog
      open={true}
      onClose={handleClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative bg-black rounded-lg overflow-hidden max-w-4xl mx-auto">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/70 text-sm z-10 hover:text-white transition-colors"
          >
            [ESC]
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
