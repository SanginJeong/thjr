import Head from "next/head";
import Button from "@/components/Button";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import Post from "@/components/Post";
import { CardAddress, CardCategory, CardDescription, CardImageBox, CardTitle } from "@/components/ShopInfo";
import { useGetShopNoticesInfiniteQuery } from "@/hooks/api/notice/useGetShopNoticesInfiniteQuery";
import { useGetShopInfoQuery } from "@/hooks/api/shop/useGetShopInfoQuery";
import { SeoulAddress } from "@/types/global";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import SkeletonUI from "@/components/Skeleton";

const ShopInfoDetail = () => {
  const router = useRouter();
  const q = router.query;
  const shopURL = q.shopId;
  const shopId = String(shopURL);

  const { data: shopInfo, isLoading: shopInfoLoading } = useGetShopInfoQuery(shopId);

  const {
    data: shopNotices,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetShopNoticesInfiniteQuery({ shopId: shopId, limit: 6 });

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const hasShopNotices = shopNotices && shopNotices.pages[0].items.length > 0;

  const handleEditClick = () => {
    router.push(`/employer/shops/${shopId}/edit`);
  };

  const handleRegisterClick = () => {
    router.push(`/employer/shops/${shopId}/notices/register`);
  };

  if (shopInfoLoading) {
    return (
      <div>
        <div className="mx-auto max-w-351 tablet:my-60 tablet:max-w-680 desktop:max-w-964">
          <SkeletonUI count={1} boxClassName="w-100 h-30 tablet:h-40 mb-16 tablet:mb-24 justify-start" />
          <SkeletonUI
            count={1}
            boxClassName="mx-auto h-424 w-351 tablet:h-680 tablet:w-646 desktop:h-356 desktop:w-964"
          />
        </div>
        <SkeletonUI count={1} boxClassName="h-435" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>가게 상세 | 더줄게</title>
        <meta name="description" content="가게 상세 정보를 확인하세요." />
      </Head>
      <div>
        <div className="mx-auto my-40 flex max-w-351 flex-col gap-16 tablet:my-60 tablet:max-w-680 tablet:gap-24 desktop:max-w-964">
          <h1 className="text-20 font-bold tablet:text-28">내 가게</h1>
          <div className="flex flex-col rounded-12 bg-green-10 p-20 tablet:p-24 desktop:flex-row desktop:gap-31">
            <CardImageBox
              imageUrl={shopInfo?.item.imageUrl ?? ""}
              startsAt={""}
              name="가게"
              closed={false}
              className="desktop:h-308"
            />
            <div className="flex flex-col justify-between gap-24 tablet:gap-40 desktop:w-346">
              <div className="flex flex-col gap-8">
                <CardCategory category={shopInfo?.item.category ?? ""} />
                <CardTitle name={shopInfo?.item.name ?? ""} />
                <CardAddress address={shopInfo?.item.address1 ?? ""} />
                <CardDescription description={shopInfo?.item.description} />
              </div>
              <div className="flex gap-8">
                <Button onClick={handleEditClick} className="h-38" status="filled">
                  편집하기
                </Button>
                <Button onClick={handleRegisterClick} className="h-38" status="lined">
                  공고 등록하기
                </Button>
              </div>
            </div>
          </div>
        </div>
        {hasShopNotices ? (
          <div className="bg-gray-5">
            <div className="mx-auto flex flex-col gap-16 px-12 pb-80 mobile:max-w-375 tablet:max-w-678 tablet:gap-32 tablet:px-0 tablet:pb-120 desktop:max-w-964">
              <h1 className="pt-40 text-20 font-bold tablet:pt-60 tablet:text-28">내가 등록한 공고</h1>
              <div className="grid grid-cols-2 gap-8 desktop:grid-cols-3 desktop:gap-14">
                {shopNotices.pages.flatMap((page) =>
                  page.items.map((notice) => (
                    <Link key={notice.item.id} href={`/employer/shops/${shopId}/notices/${notice.item.id}`}>
                      <Post
                        {...notice.item}
                        imageUrl={shopInfo?.item.imageUrl ?? ""}
                        name={shopInfo?.item.name ?? ""}
                        address={shopInfo?.item.address1 as SeoulAddress}
                        originalHourlyPay={shopInfo?.item.originalHourlyPay as number}
                      />
                    </Link>
                  )),
                )}
              </div>
              {hasNextPage && <div ref={ref} />}
              {isFetchingNextPage && <LoadingSpinner />}
            </div>
          </div>
        ) : (
          <div className="bg-gray-5">
            <div className="mx-auto max-w-351 py-80 tablet:max-w-680 tablet:py-120 desktop:max-w-964">
              <div className="flex h-195 flex-col items-center justify-center gap-24 rounded-12 border bg-transparent">
                <span>공고를 등록해보세요</span>
                <Button onClick={handleRegisterClick} className="h-37 w-108 tablet:h-47 tablet:w-346" status="filled">
                  공고 등록하기
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ShopInfoDetail;
ShopInfoDetail.getLayout = (page: React.ReactNode) => <Layout>{page}</Layout>;
