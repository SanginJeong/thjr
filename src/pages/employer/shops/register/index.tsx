import Head from "next/head";
import { useRouter } from "next/router";
import RegisterForm, { FormData } from "@/pages/employer/shops/_components/RegisterForm";
import { useEffect } from "react";
import IcClose from "@/assets/svgs/ic_close.svg";
import Layout from "@/components/Layout";
import { usePostShopQuery } from "@/hooks/api/shop/usePostShopQuery";
import { useModal } from "@/hooks/useModal";
import { useAuth } from "@/hooks/useAuth";
import { useGetMyInfoQuery } from "@/hooks/api/auth/useGetMyInfoQuery";

const RegisterShopPage = () => {
  const router = useRouter();
  const { userId, userType } = useAuth();
  const { openModal, closeModal } = useModal();
  const { mutate: postShop, isPending } = usePostShopQuery();

  const { data: myInfo } = useGetMyInfoQuery(userId, { enabled: !!userId && userType === "employer" });
  const existingShopId = myInfo?.item?.shop?.item?.id;

  useEffect(() => {
    if (!userId) {
      router.replace("/signin");
      return;
    }
    if (userType !== "employer") {
      router.replace("/joblist");
      return;
    }
    if (existingShopId) {
      openModal("confirm", "이미 등록된 가게가 있습니다.", () => router.replace(`/employer/shops/${existingShopId}`), {
        closeOnOverlayClick: false,
        closeOnEsc: false,
      });
    }
  }, [userId, userType, existingShopId, openModal, router]);

  const handleSubmit = (data: FormData) => {
    if (!data.category || !data.address1) {
      return;
    }

    postShop(
      { ...data, category: data.category, address1: data.address1 },
      {
        onSuccess: (res) => {
          const shopId = res.item.id;
          openModal("confirm", "가게 등록이 완료되었습니다.", () => router.replace(`/employer/shops/${shopId}`), {
            closeOnOverlayClick: false,
            closeOnEsc: false,
          });
        },
        onError: () => {
          openModal("confirm", "가게 등록에 실패했습니다.", closeModal);
        },
      },
    );
  };

  const handleCloseClick = () => {
    openModal("action", "가게 등록을 취소하시겠습니까?", () => router.push("/employer/shops"));
  };

  if (!userId || userType !== "employer") {
    return null;
  }

  return (
    <>
      <Head>
        <title>가게 등록 | 더줄게</title>
        <meta name="description" content="내 가게를 등록하세요." />
      </Head>
      <div className="bg-gray-5">
        <div className="m-auto max-w-1028 px-12 py-40 tablet:px-32 tablet:py-60">
          <div className="relative">
            <IcClose
              onClick={handleCloseClick}
              className="absolute right-0 top-0 w-24 hover:cursor-pointer tablet:w-32"
            />
            <h1 className="mb-32 text-20-bold text-black tablet:text-28-bold">내 가게</h1>
            <RegisterForm onSubmit={handleSubmit} isPending={isPending} submitLabel="등록" />
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterShopPage;
RegisterShopPage.getLayout = (page: React.ReactNode) => {
  return <Layout>{page}</Layout>;
};
