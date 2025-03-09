import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import cloudinary from '../utils/cloudinary'
import { getBase64ImageUrl } from '../utils/getBase64Url'
import type { ImageProps } from '../utils/types'

interface MilestoneImage extends ImageProps {
  monthNumber: number;
  blurDataUrl: string;
}

export default function Milestones({ images }: { images: MilestoneImage[] }) {
  const router = useRouter();
  const { photoId } = router.query;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Head>
        <title>Charlie&apos;s First Year - Milestones</title>
        <meta name="description" content="Watch Charlie grow through her first year - month by month milestones" />
        <meta property="og:title" content="Charlie&apos;s First Year - Milestones" />
        <meta property="og:description" content="Watch Charlie grow through her first year - month by month milestones" />
      </Head>

      <Navbar />

      <main className="pt-20 pb-8 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 font-mono animate-fade-up">
            {'>'} charlie&apos;s_first_year
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 animate-fade-up [animation-delay:200ms] before:content-['$'] before:mr-2 before:text-green-500">
            watching her grow, one month at a time
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {[...Array(12)].map((_, index) => {
            const monthNumber = index + 1;
            const image = images.find(img => img.monthNumber === monthNumber);
            
            return (
              <div 
                key={monthNumber}
                className="group relative aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 animate-fade-up shadow-sm cursor-pointer"
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
                onClick={() => image && router.push(`/milestones?photoId=${image.public_id}`, undefined, { shallow: true })}
              >
                {image ? (
                  <Image
                    src={`https://res.cloudinary.com/jpena/image/upload/q_auto,f_auto,q_40,w_800/v1/${image.public_id}.jpg`}
                    alt={`Charlie - Month ${monthNumber}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    placeholder="blur"
                    blurDataURL={image.blurDataUrl}
                    priority={monthNumber <= 6}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <p className="text-base sm:text-lg font-mono">Month {monthNumber}</p>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white font-mono text-sm sm:text-base">
                    <span className="text-green-400">$</span> month_{monthNumber}
                    <span className="opacity-50 ml-2 hidden sm:inline">{/* Date can be added here */}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {photoId && (
          <Modal 
            images={[...Array(12)].map((_, index) => {
              const monthNumber = index + 1;
              return images.find(img => img.monthNumber === monthNumber);
            }).filter((img): img is MilestoneImage => !!img)} 
          />
        )}
      </main>
    </div>
  )
}

export async function getStaticProps() {
  try {
    const results = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'milestones/month_',
      max_results: 12,
      resource_type: 'image',
      transformation: [
        { width: 800, crop: 'scale' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    const blurImagePromises = results.resources.map((image: ImageProps) => 
      getBase64ImageUrl(image, true)
    );
    const blurDataUrls = await Promise.all(blurImagePromises);

    const processedImages = results.resources.map((image: ImageProps, i: number) => {
      const monthMatch = image.public_id.match(/month_(\d+)/);
      const monthNumber = monthMatch ? parseInt(monthMatch[1]) : 0;
      
      return {
        public_id: image.public_id,
        monthNumber,
        blurDataUrl: blurDataUrls[i],
        width: image.width,
        height: image.height
      };
    });

    return {
      props: {
        images: processedImages
      },
      revalidate: 60
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      props: {
        images: []
      }
    }
  }
}