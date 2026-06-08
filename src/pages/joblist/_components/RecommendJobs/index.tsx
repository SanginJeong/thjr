import LoadingSpinner from "@/components/LoadingSpinner";
import Post from "@/components/Post";
import { useGetNoticesQuery } from "@/hooks/api/notice/useGetNoticesQuery";
import { useGetMyInfoQuery } from "@/hooks/api/auth/useGetMyInfoQuery";
import { SeoulAddress } from "@/types/global";
import Link from "next/link";
import React from "react";
import Container from "./Container";
import { useAuth } from "@/hooks/useAuth";

type RecommendJobsProps = {
  keyword: string;
};

const RecommendJobs = ({ keyword }: RecommendJobsProps) => {
  const { userId } = useAuth();
  const { data: userData, isLoading: isUserDataLoading } = useGetMyInfoQuery(userId ?? "", { enabled: !!userId });

  const userAddress = userData?.item?.address;
  const { data: recommendData, isLoading: isRecommendDataLoading } = useGetNoticesQuery(
    { offset: 0, limit: 3, sort: "pay", address: userAddress },
    { enabled: !!userAddress },
  );

  const hasRecommendData = recommendData?.items && recommendData.items.length > 0;
  const hasUserAddress = !!userAddress;
  const isEmployee = userData?.item?.type === "employee";
  const isGuest = userData?.item?.type === undefined;
  const isKeywordEmpty = !keyword || keyword.trim() === "";
  const recommendShow = isKeywordEmpty && (isGuest || isEmployee);

  const sortedRecommendData = recommendData?.items?.slice().sort((a, b) => {
    return new Date(b.item.startsAt).getTime() - new Date(a.item.startsAt).getTime();
  });

  if (!recommendShow) {
    return null;
  }

  if (!userId) {
    return <Container>로그인과 프로필 등록을 해서 맞춤 공고를 확인해보세요!</Container>;
  }

  if (isUserDataLoading || isRecommendDataLoading) {
    return (
      <Container EarlyReturn={false}>
        <div className="flex justify-center pb-100 pt-40">
          <LoadingSpinner />
        </div>
      </Container>
    );
  }

  if (!hasUserAddress) {
    return <Container>프로필 등록을 해서 주소 맞춤 공고를 확인해보세요!</Container>;
  }

  if (!hasRecommendData) {
    return <Container>아쉽지만, 고객님 주소 주변에는 알바를 구하는 가게가 없습니다😔</Container>;
  }

  return (
    <Container EarlyReturn={false}>
      <div className="flex gap-4 overflow-x-scroll pb-60 pt-31 scrollbar-hide tablet:gap-10">
        {sortedRecommendData?.map((data) => (
          <div key={data.item.id} className="flex-shrink-0">
            <Link href={`/jobinfo/${data.item.shop.item.id}/${data.item.id}`}>
              <Post
                {...data.item}
                {...data.item.shop.item}
                address={data.item.shop.item.address1 as SeoulAddress}
                className="tablet:h-348 tablet:w-312"
              />
            </Link>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default RecommendJobs;
