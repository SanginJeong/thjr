import Post from "@/components/Post";
import ListPagination from "@/components/ListPagination";
import SkeletonUI from "@/components/Skeleton";
import SelectBar from "../SelectBar";
import Link from "next/link";
import { getNoticesRequest, useGetNoticesQuery } from "@/hooks/api/notice/useGetNoticesQuery";
import { NoticeSort, SeoulAddress } from "@/types/global";
import { useEffect } from "react";
import { useRouter } from "next/router";

interface JobListSectionProps {
  params: getNoticesRequest;
  keyword: string;
  activePage: number;
  sort: NoticeSort;
  onPageChange: (page: number) => void;
  onSortChange: (option: { value: string }) => void;
  onApplyFilter: (filters: getNoticesRequest) => void;
}

const JobListSection = ({
  params,
  keyword,
  activePage,
  sort,
  onPageChange,
  onSortChange,
  onApplyFilter,
}: JobListSectionProps) => {
  const router = useRouter();
  const { data, isLoading, isError } = useGetNoticesQuery(params);

  useEffect(() => {
    if (isLoading) {
      const timeOut = setTimeout(() => {
        window.alert("네트워크 환경을 확인해 주세요.");
        router.push("/");
      }, 20000);
      return () => clearTimeout(timeOut);
    }
  }, [isLoading, router]);

  if (isLoading) {
    return (
      <div>
        <div className="mb-40 mt-60">
          <SkeletonUI
            count={1}
            boxClassName="h-30 gap-0 w-50 tablet:gap-4 tablet:h-40 tablet:w-150"
            className="mx-auto flex justify-start mobile:max-w-375 tablet:max-w-678 tablet:justify-between desktop:max-w-964"
          />
        </div>
        <div className="mx-auto mb-40 mt-42 px-12 mobile:max-w-375 tablet:max-w-678 tablet:px-0 desktop:max-w-964">
          <SkeletonUI
            count={6}
            className="grid grid-cols-2 gap-8 desktop:grid-cols-3 desktop:gap-14"
            boxClassName="h-261 w-171 flex-col rounded-xl border border-gray-20 bg-white p-12 tablet:h-361 tablet:w-332 tablet:p-16 desktop:h-348 desktop:w-312"
          />
          <SkeletonUI count={1} boxClassName="mx-auto h-40 w-400 mb-80 tablet:mb-60" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center text-20 font-bold tablet:text-28">
          <p>공고를 불러오는 중에 오류가 발생했습니다.</p>
          <Link href={"/"} className="text-primary">
            메인페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto mb-40 mt-60 px-12 mobile:max-w-375 tablet:max-w-678 tablet:px-0 desktop:max-w-964">
        <div className="mb-16 flex flex-col items-start justify-start gap-16 tablet:mb-40 tablet:flex-row tablet:items-center tablet:justify-between">
          {keyword.trim() !== "" ? (
            <div className="text-20 font-bold tablet:text-28">
              <h2 className="inline text-primary">{keyword}</h2>에 대한 공고 목록
            </div>
          ) : (
            <h2 className="text-20 font-bold tablet:text-28">전체 공고</h2>
          )}
          <SelectBar sort={sort} onSortChange={onSortChange} onApplyFilter={onApplyFilter} />
        </div>
        {data?.items?.length ? (
          <div className="grid grid-cols-2 gap-8 desktop:grid-cols-3 desktop:gap-14">
            {data.items.map((item) => (
              <Link key={item.item.id} href={`/jobinfo/${item.item.shop.item.id}/${item.item.id}`}>
                <Post
                  {...item.item}
                  {...item.item.shop.item}
                  address={item.item.shop.item.address1 as SeoulAddress}
                  id={item.item.shop.item.id}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-100 flex justify-center">
            <p className="text-14 font-bold tablet:text-20">조건에 맞는 공고가 없습니다.</p>
          </div>
        )}
      </div>

      <div className="mb-80 tablet:mb-60">
        <ListPagination
          limit={params.limit ?? 6}
          count={data?.count ?? 0}
          activePage={activePage}
          hasNext={data?.hasNext ?? false}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default JobListSection;
