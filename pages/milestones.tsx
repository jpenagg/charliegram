import Head from 'next/head'
import Image from 'next/image'
import Navbar from '../components/Navbar'
import cloudinary from '../utils/cloudinary'
import { getBase64ImageUrl } from '../utils/getBase64Url'
import type { ImageProps } from '../utils/types'

interface MilestoneImage extends ImageProps {
  monthNumber: number;
  blurDataUrl: string;
}

interface SpecialMoment extends ImageProps {
  blurDataUrl: string;
}

export default function Milestones({ 
  monthlyImages, 
  firstSteps,
  firstHome,
  firstDaycare 
}: { 
  monthlyImages: MilestoneImage[],
  firstSteps: SpecialMoment | null,
  firstHome: SpecialMoment | null,
  firstDaycare: SpecialMoment | null
}) {
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
        {/* Monthly Progress Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 font-mono animate-fade-up">
            {'>'} charlie&apos;s_first_year
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 animate-fade-up [animation-delay:200ms] before:content-['$'] before:mr-2 before:text-green-500">
            watching her grow, one month at a time
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-16">
          {[...Array(12)].map((_, index) => {
            const monthNumber = index + 1;
            const image = monthlyImages.find(img => img.monthNumber === monthNumber);
            
            return (
              <div 
                key={monthNumber}
                className="group relative aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 animate-fade-up shadow-sm"
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
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
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Special Moments Header */}
        <div className="text-center mb-8 sm:mb-12 mt-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 font-mono animate-fade-up">
            {'>'} special_moments
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 animate-fade-up [animation-delay:200ms] before:content-['$'] before:mr-2 before:text-green-500">
            capturing life&apos;s precious milestones
          </p>
        </div>

        {/* Special Moments Grid */}
        <div className="grid grid-cols-1 gap-12">
          {[
            { title: 'first_steps', image: firstSteps, isVideo: true },
            { title: 'first_day_at_her_new_home', image: firstHome },
            { title: 'first_day_at_daycare', image: firstDaycare }
          ].map((section, index) => (
            <div key={section.title} 
              className="animate-fade-up"
              style={{ animationDelay: `${(index + 2) * 100}ms` }}
            >
              <div className="max-w-3xl mx-auto">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-lg">
                  {section.image ? (
                    section.isVideo ? (
                      <video 
                        src={`https://res.cloudinary.com/jpena/video/upload/q_auto/v1/${section.image.public_id}.mov`}
                        className="w-full h-full object-cover"
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <Image
                        src={`https://res.cloudinary.com/jpena/image/upload/q_auto,f_auto,q_40,w_1200/v1/${section.image.public_id}.jpg`}
                        alt={section.title.replace(/_/g, ' ')}
                        fill
                        className="object-cover"
                        placeholder="blur"
                        blurDataURL={section.image.blurDataUrl}
                        priority
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <p className="text-base sm:text-lg font-mono">Coming soon</p>
                    </div>
                  )}
                </div>
                <p className="mt-4 text-lg sm:text-xl font-mono text-gray-900 dark:text-white text-center">
                  <span className="text-green-500">$</span> {section.title.replace('charlies_', '')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export async function getStaticProps() {
  try {
    // Fetch all resources from milestones directory
    const allResults = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'milestones/',
      max_results: 20,
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        { quality: 40, width: 800 } // Further reduce quality and size
      ]
    });

    const blurPromises = allResults.resources.map((image: ImageProps) => 
      getBase64ImageUrl(image)
    );
    const blurUrls = await Promise.all(blurPromises);

    // Process monthly images
    const monthlyImages = allResults.resources
      .filter(image => image.public_id.match(/month_\d+/))
      .map((image: ImageProps, i: number) => {
        const monthMatch = image.public_id.match(/month_(\d+)/);
        const monthNumber = monthMatch ? parseInt(monthMatch[1]) : 0;
        
        return {
          public_id: image.public_id,
          monthNumber,
          blurDataUrl: blurUrls[allResults.resources.findIndex(img => img.public_id === image.public_id)]
        };
      });

    // Fetch first_steps video
    const videoResults = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'milestones/',
      max_results: 1,
      resource_type: 'video'
    });

    const firstSteps = videoResults.resources.find(video => video.public_id.includes('first_steps'))
      ? {
          public_id: videoResults.resources.find(video => video.public_id.includes('first_steps'))?.public_id,
          blurDataUrl: ''
        }
      : null;

    // Find special photos in milestones directory
    const firstHome = allResults.resources.find(img => img.public_id.includes('first_home'))
      ? {
          public_id: allResults.resources.find(img => img.public_id.includes('first_home'))?.public_id,
          blurDataUrl: blurUrls[allResults.resources.findIndex(img => img.public_id.includes('first_home'))]
        }
      : null;

    const firstDaycare = allResults.resources.find(img => img.public_id.includes('first_daycare'))
      ? {
          public_id: allResults.resources.find(img => img.public_id.includes('first_daycare'))?.public_id,
          blurDataUrl: blurUrls[allResults.resources.findIndex(img => img.public_id.includes('first_daycare'))]
        }
      : null;

    return {
      props: {
        monthlyImages,
        firstSteps,
        firstHome,
        firstDaycare
      },
      revalidate: 60
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      props: {
        monthlyImages: [],
        firstSteps: null,
        firstHome: null,
        firstDaycare: null
      }
    }
  }
}