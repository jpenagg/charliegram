import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from 'next/router'
import cloudinary from "../utils/cloudinary"
import type { ImageProps } from "../utils/types"
import Footer from "../components/Footer"
import Modal from "../components/Modal"
import Nav from "../components/Nav";
import { getBase64ImageUrl } from "../utils/getBase64Url";

export default function Home({ images }: { images: ImageProps[] }) {
  const router = useRouter()
  const { photoId } = router.query
  return (
    <>
      <Head>
        <title>charliegram</title>
      </Head>
        <Nav />
        <main className="mx-auto max-w-[2000px]">
          {photoId && (
            <Modal
              images={images}
            />
          )}
          <div className="columns-1 gap-4 text-xs:columns-2 sm:columns-3 xl:columns-3 2xl:columns-6 mx-4">
            {images.map(({ id, blurDataUrl, public_id, format }) => (
              <Link
                key={id}
                href={`/?photoId=${id}`}
                as={`/p/${id}`}
              >
                <Image
                  width="750"
                  height="1000"
                  src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_jpg/${public_id}.${format}`}
                  alt=""
                  className="mb-4 rounded-lg"
                  placeholder="blur"
                  blurDataURL={blurDataUrl}
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
    .execute()

  let reducedImages: ImageProps[] = []

  let i = 0
  for (let result of results.resources) {
    reducedImages.push({
      id: i,
      height: result.height,
      width: result.width,
      image: result.secure_url,
      public_id: result.public_id,
      format: result.format
    })
    i++
  }

  const blurImagePromises = results.resources.map((image: ImageProps) => {
    return getBase64ImageUrl(image)
  })
  
  const imagesWithBlurDataUrls = await Promise.all(blurImagePromises)

  for (let i = 0; i < reducedImages.length; i++) {
    reducedImages[i].blurDataUrl = imagesWithBlurDataUrls[i]
  }

  return {
    props: {
      images: reducedImages,
    }
  }
}
