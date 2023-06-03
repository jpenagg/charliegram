import Image from "next/image";
import { Dialog } from "@headlessui/react";
import { useRouter } from "next/router";
import { useRef } from "react";
import type { ImageProps } from "../utils/types";

export default function Modal({
  images,
}: {
  images: ImageProps[]
}) {
  let overlayRef = useRef(null)
  const router = useRouter()

  const { photoId } = router.query
 
  let curIndex = Number(photoId)

  let curImage = images[curIndex]

  return (
    <Dialog
      static
      open={true}
      onClose={() => {
        router.push("/");
      }}
      initialFocus={overlayRef}
      className="fixed inset-0 z-10 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black/75"/>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Overlay
          ref={overlayRef}
          className="fixed inset-0"
        />
        <Image 
          width="750"
          height="1000"
          src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_jpg/${curImage.public_id}.${curImage.format}`}
          alt=""
          className="mb-4 rounded-lg"
          placeholder="blur"
          blurDataURL={curImage.blurDataUrl}
        />
      </div>
    </Dialog>
  )
}
