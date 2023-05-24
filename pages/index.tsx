import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from 'next/router'
import cloudinary from "../utils/cloudinary"
import type { ImageProps } from "../utils/types"
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function Home({ images }: { images: ImageProps[] }) {
  const router = useRouter()
  const { photoId } = router.query
  return (
    <>
      <Head>
        <title>chxrliezxrd</title>
      </Head>
        <Header />
        <main className="mx-auto max-w-[2000px]">
          <div className="columns-1 gap-4 text-xs:columns-2 sm:columns-3 xl:columns-3 2xl:columns-5 mx-4">
              {images.map(({ id, height, width, image }) => (
                <Link
                  key={id}
                  href={`/?photoId=${id}`}
                  as={`/p/${id}`}
                >
                  <Image 
                    width={height}
                    height={width}
                    src={image}
                    alt=""
                    className="mb-4 rounded-lg"
                  />
                </Link>
              ))}
          </div>
        </main>
        <Footer />
    </>
  );
}

export async function getStaticProps() {
  const results = await cloudinary.v2.search
    .expression(`folder:${process.env.CLOUDINARY_FOLDER}/*`)
    .sort_by('public_id', 'desc')
    .max_results(400)
    .execute()

  let reducedImages: ImageProps[] = []

  let i = 0
  for (let result of results.resources) {
    reducedImages.push({
      id: i,
      height: result.height,
      width: result.width,
      image: result.secure_url,
    })
    i++
  }

  return {
    props: {
      images: reducedImages,
    }
  }
}
