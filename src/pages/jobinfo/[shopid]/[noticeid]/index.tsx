import Head from "next/head";
import { ReactNode } from "react";
import Layout from "@/components/Layout";
import { useGetShopNoticeDetailQuery } from "@/hooks/api/notice/useGetShopNoticeDetailQuery";
import JobDetail from "../../_components/jobdetail";
import RecentList from "../../_components/recentlist";
import { useRouter } from "next/router";

const JobInfo = () => {
  const router = useRouter();
  const q = router.query;
  const shopURL = q.shopId;
  const noticeURL = q.noticeId;

  const shopId = String(shopURL);
  const noticeId = String(noticeURL);

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
