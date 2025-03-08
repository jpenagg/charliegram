import Head from 'next/head'
import Image from 'next/image'

export default function Milestones() {
  return (
    <div className="min-h-screen">
      <Head>
        <title>Charlie&apos;s First Year - Milestones</title>
        <meta name="description" content="Watch Charlie grow through her first year - month by month milestones" />
        <meta property="og:title" content="Charlie&apos;s First Year - Milestones" />
        <meta property="og:description" content="Watch Charlie grow through her first year - month by month milestones" />
      </Head>

      <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-up">
            {'>'} charlie&apos;s_first_year
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 animate-fade-up [animation-delay:200ms] before:content-['$'] before:mr-2 before:text-green-500">
            watching her grow, one month at a time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(12)].map((_, index) => (
            <div 
              key={index + 1}
              className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 animate-fade-up"
              style={{ animationDelay: `${(index + 2) * 100}ms` }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <p className="text-lg font-mono">Month {index + 1}</p>
              </div>
              {/* Image component will be added once we have the actual photos */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-white font-mono">
                  <span className="text-green-400">$</span> month_{index + 1} 
                  <span className="opacity-50 ml-2">{/* Date can be added here */}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}