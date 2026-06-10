import Head from "next/head";
import { useGetMyInfoQuery } from "@/hooks/api/auth/useGetMyInfoQuery";
import Layout from "@/components/Layout";
import { ReactNode } from "react";
import SkeletonUI from "@/components/Skeleton";
import Button from "@/components/Button";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";

const Profile = () => {
  const { userId } = useAuth();
  const { data: userInfo, isPending } = useGetMyInfoQuery(userId);

  const router = useRouter();

  if (isPending) {
    return (
      <div className="mx-auto max-w-5xl px-24 py-60">
        <SkeletonUI count={1} boxClassName="h-40 w-105" />
        <SkeletonUI count={1} boxClassName="h-211 w-976 my-33" />
      </div>
    );
  }

  if (!userInfo) {
    return null;
  }

  const hasProfile = !!(userInfo.item.name && userInfo.item.phone && userInfo.item.address);

  if (hasProfile) {
    router.push(`/profile/${userId}`);
  }

  return (
    <>
      <Head>
        <title>내 프로필 | 더줄게</title>
        <meta name="description" content="내 프로필을 관리하세요." />
      </Head>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-24 py-60">
        <h2 className="text-20-bold tablet:text-28-bold">내 프로필</h2>
        <section className="my-20 flex flex-col items-center justify-center gap-24 rounded-xl border border-gray-20 px-24 py-60">
          <p className="text-14-regular tablet:text-16-regular">내 프로필을 등록하고 원하는 가게에 지원해 보세요</p>
          <Link href="/profile/register">
            <Button status="filled" className="w-150 px-20 py-10 tablet:w-346">
              내 프로필 등록하기
            </Button>
          </Link>
        </section>
      </div>
    </>
  );
};

Profile.getLayout = (page: ReactNode) => {
  return <Layout>{page}</Layout>;
};

export default Profile;
