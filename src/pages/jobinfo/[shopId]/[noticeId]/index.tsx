import Head from "next/head";
import { ReactNode } from "react";
import Layout from "@/components/Layout";
import { getShopNoticeDetail, useGetShopNoticeDetailQuery } from "@/hooks/api/notice/useGetShopNoticeDetailQuery";
import JobDetail from "../../_components/jobdetail";
import RecentList from "../../_components/recentlist";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";
import { QueryClient, dehydrate } from "@tanstack/react-query";

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const shopId = context.params?.shopId as string;
  const noticeId = context.params?.noticeId as string;

  const queryClient = new QueryClient();

  if (shopId && noticeId) {
    await queryClient.prefetchQuery({
      queryKey: ["getShopNoticeDetail", shopId, noticeId],
      queryFn: () => getShopNoticeDetail({ shopId, noticeId }),
    });
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const JobInfo = () => {
  const router = useRouter();
  const q = router.query;
  const shopId = typeof q.shopId === "string" ? q.shopId : "";
  const noticeId = typeof q.noticeId === "string" ? q.noticeId : "";

  const { data: jobData, isPending } = useGetShopNoticeDetailQuery({ shopId, noticeId });

  return (
    <>
      <Head>
        <title>공고 상세 | 더줄게</title>
        <meta name="description" content="공고 상세 정보를 확인하고 지원하세요." />
      </Head>
      <div className="bg-gray-5">
        <div className="mx-auto flex max-w-375 flex-col tablet:max-w-680 desktop:max-w-964">
          <JobDetail shopId={shopId} noticeId={noticeId} jobData={jobData} isPending={isPending} />
          <RecentList />
        </div>
      </div>
    </>
  );
};

export default JobInfo;

JobInfo.getLayout = (page: ReactNode) => {
  return <Layout>{page}</Layout>;
};
