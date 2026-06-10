import Head from "next/head";
import { useState } from "react";
import JobInfoCard from "@/pages/employer/_components/JobInfoCard";
import JobInfoTable from "@/pages/employer/_components/JobInfoTable";
import MessageModal from "@/components/Modal/MessageModal";
import { usePutShopApplicationQuery } from "@/hooks/api/application/usePutShopApplicationQuery";
import { useGetShopApplicationsQuery } from "@/hooks/api/application/useGetShopApplicationsQuery";
import { useGetShopNoticeDetailQuery } from "@/hooks/api/notice/useGetShopNoticeDetailQuery";
import { ResultStatus } from "@/types/global";
import IcCheck from "@/assets/svgs/ic_check.svg";
import Layout from "@/components/Layout";
import { ReactNode } from "react";
import { useRouter } from "next/router";

const LIMIT = 5;

const JobInfo = () => {
  const router = useRouter();
  const q = router.query;
  const shopURL = q.shopId;
  const noticeURL = q.noticeId;

  const shopId = String(shopURL);
  const noticeId = String(noticeURL);

  const [modalMessage, setModalMessage] = useState("");
  const [approval, setApproval] = useState<ResultStatus | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [sendId, setSendId] = useState("");
  const [page, setPage] = useState(1);
  const { data: shopData } = useGetShopNoticeDetailQuery({ shopId, noticeId });
  const {
    data: appData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetShopApplicationsQuery({
    shopId: shopId,
    noticeId: noticeId,
    params: {
      offset: (page - 1) * LIMIT,
      limit: LIMIT,
    },
  });

  const shopInfo = shopData?.item;
  const res = appData?.items ?? [];
  const totalCount = appData?.count ?? 0;
  const hasNextPage = appData?.hasNext ?? false;

  const onHandlePageChange = (pageNumber: number) => {
    setPage(pageNumber);
  };

  const handleClose = () => {
    setIsOpen(!isOpen);
  };

  const onModalMessage = (approval: ResultStatus, sendId: string) => {
    setApproval(approval);
    setSendId(sendId);
    setIsOpen(true);
    if (approval === "rejected") {
      setModalMessage("신청을 거절하시겠어요?");
    } else if (approval === "accepted") {
      setModalMessage("신청을 승인하시겠어요?");
    }
  };

  const mutation = usePutShopApplicationQuery();
  const handleApprovalClick = (status: ResultStatus, sendId: string) => {
    mutation.mutate(
      {
        shopId: appData?.items[0].item.shop.item.id || "",
        noticeId: appData?.items[0].item.notice.item.id || "",
        applicationId: sendId || "",
        data: { status },
      },
      {
        onSuccess: () => {
          refetch();
        },
        onError: (error) => {
          console.error("실패했어요:", error);
        },
      },
    );
    setIsOpen(false);
  };

  if (isError) {
    return <p>{error.message}</p>;
  }

  return (
    <>
      <Head>
        <title>공고 관리 | 더줄게</title>
        <meta name="description" content="공고 상세 및 지원자 현황을 확인하세요." />
      </Head>
      <div className="bg-gray-5">
        <div className="px-12 tablet:px-32">
          <>
            <section className="mx-auto py-40 tablet:py-60 desktop:max-w-964">
              <JobInfoCard
                res={shopInfo}
                bgColor={"bg-white"}
                shopId={shopId}
                noticeId={noticeId}
                isLoading={isLoading}
                closed={res[0]?.item?.notice.item.closed}
              />
            </section>
            <section className="mx-auto py-40 tablet:py-60 desktop:max-w-964">
              <h2 className="mb-32 text-20-bold tablet:text-28-bold">신청자 목록</h2>
              <JobInfoTable
                res={res}
                limit={LIMIT}
                count={totalCount}
                hasNext={hasNextPage}
                activePage={page}
                isLoading={isLoading}
                error={isError}
                onPageChange={onHandlePageChange}
                onModalMessage={onModalMessage}
              />
            </section>
          </>
        </div>

        {isOpen && (
          <MessageModal
            isOpen={isOpen}
            icon={<IcCheck />}
            message={modalMessage}
            onClose={handleClose}
            footers={[
              {
                buttonText: "아니요",
                onClick: () => handleClose(),
                style: "lined",
                className: "w-80 h-38",
              },
              {
                buttonText: "예",
                onClick: () => {
                  if (approval === "rejected" || approval === "accepted") {
                    handleApprovalClick(approval, sendId);
                  }
                },
                style: "filled",
                className: "w-80 h-38",
              },
            ]}
          ></MessageModal>
        )}
      </div>
    </>
  );
};

JobInfo.getLayout = (page: ReactNode) => {
  return <Layout>{page}</Layout>;
};

export default JobInfo;
