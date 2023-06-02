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
  let overlayRef = useRef()
  const router = useRouter()

  let currentImage = images[0]

  return (
    <Dialog
      static
      open={true}
      onClose={() => {
        router.push("/");
      }}
      className="fixed inset-0 z-10 flex items-center justify-center"
    >
      <Dialog.Overlay
        ref={overlayRef}
        className="fixed inset-0 z-30 bg-black/50 backdrop-blur-2xl"
      />
      <Image 
        width="750"
        height="1000"
        src={currentImage.image}
        alt=""
        className="mb-4 rounded-lg"
        placeholder="blur"
        blurDataURL={currentImage.blurDataUrl}
      />
    </Dialog>
  )
}
