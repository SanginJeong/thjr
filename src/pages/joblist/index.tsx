import Head from "next/head";
import Layout from "@/components/Layout";
import { getNotices, getNoticesRequest } from "@/hooks/api/notice/useGetNoticesQuery";
import { NoticeSort } from "@/types/global";
import { useRouter } from "next/router";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import RecommendJobs from "./_components/RecommendJobs";
import JobListSection from "./_components/JobListSection";

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const query = context.query;

  const page = Number(query.page) || 1;
  const sort = (query.sort as NoticeSort) || "time";
  const limit = 6;
  const offset = (page - 1) * limit;
  const { page: _page, sort: _sort, ...filterConditions } = query;

  const jobDataApiParams: getNoticesRequest = { offset, limit, sort, ...filterConditions };

  if (sort === "time") {
    jobDataApiParams.startsAtGte = new Date(Date.now() + 10000).toISOString().split(".")[0] + "Z";
  }

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["getNotices", jobDataApiParams],
    queryFn: () => getNotices(jobDataApiParams),
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const JobList = ({}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { query } = router;
  const page = Number(query.page) || 1;
  const sort = (query.sort as NoticeSort) || "time";
  const limit = 6;
  const offset = (page - 1) * limit;
  const { page: _page, sort: _sort, ...filterConditions } = query;

  const keyword = Array.isArray(query.keyword) ? query.keyword[0] : query.keyword || "";
  const jobDataApiParams: getNoticesRequest = { offset, limit, sort, ...filterConditions };

  if (sort === "time") {
    const tenSecondsLater = new Date(Date.now() + 10000).toISOString().split(".")[0] + "Z";
    if (!jobDataApiParams.startsAtGte || jobDataApiParams.startsAtGte < tenSecondsLater) {
      jobDataApiParams.startsAtGte = tenSecondsLater;
    }
  }

  const handleApplyFilter = (newFilters: getNoticesRequest) => {
    const filterKeys = Object.keys(newFilters);
    const cleanFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([, v]) => v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)),
    ) as getNoticesRequest;
    const baseQuery = Object.fromEntries(Object.entries(query).filter(([k]) => !filterKeys.includes(k)));
    router.push(
      { pathname: router.pathname, query: { ...baseQuery, ...cleanFilters, page: 1 } },
      undefined,
      { shallow: true },
    );
  };

  const handlePageChange = (pageNumber: number) => {
    router.push(
      { pathname: router.pathname, query: { ...query, page: pageNumber } },
      undefined,
      { shallow: true },
    );
  };

  const handleSortChange = (option: { value: string }) => {
    router.push(
      { pathname: router.pathname, query: { ...query, sort: option.value as NoticeSort, page: 1 } },
      undefined,
      { shallow: true },
    );
  };

  return (
    <>
      <Head>
        <title>전체 공고 | 더줄게</title>
        <meta name="description" content="더줄게의 전체 공고를 확인하세요." />
      </Head>
      <div>
        <RecommendJobs keyword={keyword} />
        <JobListSection
          params={jobDataApiParams}
          keyword={keyword}
          activePage={page}
          sort={sort}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
          onApplyFilter={handleApplyFilter}
        />
      </div>
    </>
  );
};

export default JobList;
JobList.getLayout = (page: React.ReactNode) => <Layout>{page}</Layout>;
