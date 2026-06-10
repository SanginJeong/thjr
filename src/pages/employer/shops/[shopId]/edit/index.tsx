import Head from "next/head";
import { useGetShopInfoQuery } from "@/hooks/api/shop/useGetShopInfoQuery";
import { usePutShopInfoQuery } from "@/hooks/api/shop/usePutShopInfoQuery";
import RegisterForm, { FormData } from "@/pages/employer/shops/_components/RegisterForm";
import { useEffect } from "react";
import IcClose from "@/assets/svgs/ic_close.svg";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { useModal } from "@/hooks/useModal";
import SkeletonUI from "@/components/Skeleton";
import { QueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

const EditShopPage = () => {
  const router = useRouter();
  const { shopId } = router.query;
  const { userId } = useAuth();
  const shopIdStr = String(shopId);
  const queryClient = new QueryClient();
  const { data: shopData, isPending: isGetPending } = useGetShopInfoQuery(shopIdStr);
  const { mutate: updateShop, isPending: isPutPending } = usePutShopInfoQuery();

  const { openModal, closeModal } = useModal();

  const handleSubmit = (data: FormData) => {
    if (!data.category || !data.address1) {
      return;
    }
    updateShop(
      { shopId: shopIdStr, data: { ...data, id: shopIdStr, category: data.category, address1: data.address1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["getShopInfo", shopIdStr] });
          openModal("confirm", "가게 정보 수정이 완료되었습니다.", () => router.replace(`/employer/shops/${shopIdStr}`), {
            closeOnOverlayClick: false,
            closeOnEsc: false,
          });
        },
        onError: () => {
          openModal("confirm", "가게 정보 수정에 실패했습니다.", closeModal);
        },
      },
    );
  };

  const handleCloseClick = () => {
    openModal("action", "가게 정보 수정을 취소하시겠습니까?", () => router.push(`/employer/shops/${shopIdStr}`));
  };

  useEffect(() => {
    if (!isGetPending && shopData) {
      const writerId = shopData.item.user.item.id;
      if (writerId !== userId) {
        router.replace("/joblist");
      }
    }
  }, [isGetPending, shopData, router, userId]);

  if (isGetPending || !shopData) {
    return (
      <div className="bg-gray-5">
        <div className="m-auto max-w-1028 px-12 py-40 tablet:px-32 tablet:py-60">
          <h1 className="mb-32 text-20-bold text-black tablet:text-28-bold">가게 수정</h1>
          <div className="mt-64 grid grid-cols-1 gap-x-20 gap-y-40 tablet:[grid-template-columns:repeat(auto-fit,minmax(330px,1fr))]">
            <SkeletonUI count={1} boxClassName="h-60 w-full mb-16 rounded-md" />
            <SkeletonUI count={1} boxClassName="h-60 w-full mb-16 rounded-md" />
            <SkeletonUI count={1} boxClassName="h-60 w-full mb-16 rounded-md" />
            <SkeletonUI count={1} boxClassName="h-60 w-full mb-16 rounded-md" />
            <SkeletonUI count={1} boxClassName="h-60 w-full mb-16 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  const defaultValues: FormData = {
    name: shopData.item.name,
    category: shopData.item.category,
    address1: shopData.item.address1,
    address2: shopData.item.address2,
    description: shopData.item.description,
    imageUrl: shopData.item.imageUrl,
    originalHourlyPay: shopData.item.originalHourlyPay,
  };

  return (
    <>
      <Head>
        <title>가게 수정 | 더줄게</title>
        <meta name="description" content="가게 정보를 수정하세요." />
      </Head>
      <div className="bg-gray-5">
        <div className="m-auto max-w-1028 px-12 py-40 tablet:px-32 tablet:py-60">
          <div className="relative">
            <IcClose
              onClick={handleCloseClick}
              className="absolute right-0 top-0 w-24 hover:cursor-pointer tablet:w-32"
            />
            <h1 className="mb-32 text-20-bold text-black tablet:text-28-bold">가게 수정</h1>
            <RegisterForm
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              isPending={isPutPending}
              submitLabel="수정"
            />
          </div>
        </div>
      </div>
    </>
  );
};

EditShopPage.getLayout = (page: React.ReactNode) => {
  return <Layout>{page}</Layout>;
};
export default EditShopPage;
