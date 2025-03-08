import Head from 'next/head'
import Image from 'next/image'

export default function About() {
  return (
    <div className="min-h-screen">
      <Head>
        <title>For Charlie - charliegram</title>
        <meta name="description" content="A father's love letter to his daughter Charlie, built during paternity leave in 2023" />
        <meta property="og:title" content="For Charlie - charliegram" />
        <meta property="og:description" content="A father's love letter to his daughter Charlie, built during paternity leave in 2023" />
        <meta property="og:image" content={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/about/IMG_1603_sz8apk`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto font-mono">
        <div className="prose dark:prose-invert mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 animate-fade-up">
            {'>'} for charlie_
          </h1>
          
          <div className="space-y-6 text-gray-600 dark:text-gray-300">
            <p className="text-lg leading-relaxed animate-fade-up [animation-delay:200ms] before:content-['$'] before:mr-2 before:text-green-500">
              On April 22, 2023, my world changed forever when my daughter Charlie was born. 
              As a software engineer, I wanted to create something special for her – something 
              that would capture and preserve the beautiful moments of her life.
            </p>

            <p className="text-lg leading-relaxed animate-fade-up [animation-delay:400ms] before:content-['$'] before:mr-2 before:text-green-500">
              This website is my gift to Charlie, built with love and code during my paternity leave, 
              in the quiet moments while she slept. It&apos;s a digital time capsule where I can share 
              her journey, her smiles, and all the little moments that make life magical.
            </p>

            <p className="text-lg leading-relaxed animate-fade-up [animation-delay:600ms] before:content-['$'] before:mr-2 before:text-green-500">
              charliegram isn&apos;t just a photo gallery; it&apos;s a father&apos;s love letter to his 
              daughter, crafted one line of code at a time. It&apos;s my way of showing her that 
              even before she could understand what programming was, she was already inspiring 
              me to create.
            </p>

            <div className="mt-12 relative aspect-[4/3] w-full overflow-hidden rounded-xl animate-fade-up [animation-delay:800ms]">
              <Image
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/about/IMG_1603_sz8apk`}
                alt="Baby Charlie"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority
                quality={90}
                sizes="(max-width: 768px) 100vw, 800px"
                placeholder="blur"
                blurDataURL={`data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy0vLi44QjhAOEA4Qi5AODkvQj09QjlDRUlKSUpDPUNFQj3/2wBDAQoLCw8NDx0QEBo9JSUlPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT3/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=`}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}