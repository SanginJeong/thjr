import { isStartTimePassed } from "@/utils/formatTime";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const FALLBACK_IMAGE = "/images/img_shopdefault.jpg";

interface Props {
  startsAt: string;
  imageUrl: string;
  closed: boolean;
  priority?: boolean;
}

/*
!isPassed && closed: 지난 공고이면서 마감완료일 때는 지난 공고만 띄우도록 결정
*/

const PostImage = ({ startsAt, imageUrl, closed, priority = false }: Props) => {
  const isPassed = isStartTimePassed(startsAt);
  const [src, setSrc] = useState(imageUrl || FALLBACK_IMAGE);

  useEffect(() => {
    setSrc(imageUrl || FALLBACK_IMAGE);
  }, [imageUrl]);

  return (
    <div className="relative h-full w-full flex-[2]">
      <Image
        src={src}
        alt="가게 이미지"
        fill
        sizes="(max-width: 640px) 171px, (max-width: 1280px) 332px, 312px"
        className="h-full w-full rounded-xl object-cover"
        priority={priority}
        onError={() => setSrc(FALLBACK_IMAGE)}
      />
      {isPassed && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black opacity-70">
          <span className="px-4 py-2 text-28-bold text-gray-30">지난 공고</span>
        </div>
      )}

      {!isPassed && closed && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black opacity-70">
          <span className="px-4 py-2 text-28-bold text-gray-30">마감 완료</span>
        </div>
      )}
    </div>
  );
};

export default PostImage;
