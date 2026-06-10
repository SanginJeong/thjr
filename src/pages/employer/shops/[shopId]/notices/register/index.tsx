import Head from "next/head";
import { useRouter } from "next/router";
import RegisterForm, { FormData } from "../_components/RegisterForm";
import { usePostShopNoticesQuery } from "@/hooks/api/notice/usePostShopNoticesQuery";
import IcClose from "@/assets/svgs/ic_close.svg";
import Layout from "@/components/Layout";
import { useModal } from "@/hooks/useModal";
import { useQueryClient } from "@tanstack/react-query";

const RegisterJobinfo = () => {
  const router = useRouter();
  const q = router.query;
  const shopId = typeof q.shopId === "string" ? q.shopId : "";

  const queryClient = useQueryClient();
  const { mutate: postShopNotice, isPending } = usePostShopNoticesQuery();
  const { openModal, closeModal } = useModal();

  const handleSubmit = (data: FormData) => {
    postShopNotice(
      { shopId: shopId, data },
      {
        onSuccess: (res) => {
          const notice_id = res.item.id;
          queryClient.invalidateQueries({ queryKey: ["getShopNotices", shopId] });
          openModal("confirm", "공고 등록이 완료되었습니다.", () => router.replace(`/employer/shops/${shopId}/notices/${notice_id}`), {
            closeOnOverlayClick: false,
            closeOnEsc: false,
          });
        },
        onError: () => {
          openModal("confirm", "공고 등록에 실패했습니다.", closeModal);
        },
      },
    );
  };

  const handleCloseClick = () => {
    openModal("action", "공고 등록을 취소하시겠습니까?", () => router.push(`/employer/shops/${shopId}`));
  };

  return (
    <>
      <Head>
        <title>공고 등록 | 더줄게</title>
        <meta name="description" content="새 공고를 등록하세요." />
      </Head>
      <div className="bg-gray-5">
        <div className="m-auto max-w-1028 px-12 py-40 tablet:px-32 tablet:py-60">
          <div className="relative">
            <button
              type="button"
              onClick={handleCloseClick}
              aria-label="공고 등록 취소"
              className="absolute right-0 top-0"
            >
              <IcClose className="w-24 tablet:w-32" />
            </button>
            <h1 className="mb-32 text-20-bold text-black tablet:text-28-bold">공고 등록</h1>
            <RegisterForm onSubmit={handleSubmit} isPending={isPending} submitLabel="등록" />
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterJobinfo;
RegisterJobinfo.getLayout = (page: React.ReactNode) => {
  return <Layout>{page}</Layout>;
};
