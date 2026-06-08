import IcNotice from "@/assets/svgs/ic_notification.svg";
import Link from "next/link";
import NotificationWrapper from "@/components/NotificationWrapper";
import { cn } from "@/utils";
import { useLogoutQuery } from "@/hooks/api/auth/useLogoutQuery";
import { useRef, useState } from "react";
import { useGetUserAlertsQuery } from "@/hooks/api/alert/useGetUserAlertsQuery";
import { useAuth } from "@/hooks/useAuth";

const linkStyle = "text-14-bold tablet:text-16-bold";
const navStyle = "order-2 ml-auto flex h-30 shrink-0 tablet:order-3 tablet:h-40";

const guestMenuItem = {
  signin: {
    title: "로그인",
    href: "/signin",
  },
  signup: {
    title: "회원가입",
    href: "/signup",
  },
};

const userMenuItem = {
  userPage: {
    employee: {
      title: "내 프로필",
      href: "/profile",
    },
    employer: {
      title: "내 가게",
      href: "/shopinfo",
    },
  },
  logout: {
    title: "로그아웃",
    href: "/joblist",
  },
};

const GuestMenu = () => {
  return (
    <ul className="flex items-center gap-16 desktop:gap-40">
      <li>
        <Link href={guestMenuItem.signin.href} className={linkStyle}>
          {guestMenuItem.signin.title}
        </Link>
      </li>
      <li>
        <Link href={guestMenuItem.signup.href} className={linkStyle}>
          {guestMenuItem.signup.title}
        </Link>
      </li>
    </ul>
  );
};

const UserHeader = () => {
  const { userId, userType, isMounted } = useAuth();
  const { logout } = useLogoutQuery();
  const { data: alertData } = useGetUserAlertsQuery({ userId, options: { enabled: !!userId } });

  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const hasUnread = alertData?.items?.some((i) => !i.item.read) ?? false;

  const handleLogoutClick = () => {
    logout();
  };

  const handleNoticeToggle = () => {
    setIsNoticeOpen((prev) => !prev);
  };
  const handleNoticeClose = () => {
    setIsNoticeOpen(false);
  };

  if (!isMounted) {
    return <nav className={navStyle} />;
  }

  if (!userId) {
    return (
      <nav className={navStyle}>
        <GuestMenu />
      </nav>
    );
  }

  return (
    <nav className={navStyle}>
      <ul className="flex items-center gap-16 desktop:gap-40">
        {userType && (
          <li>
            <Link href={userMenuItem.userPage[userType].href} className={linkStyle}>
              {userMenuItem.userPage[userType].title}
            </Link>
          </li>
        )}
        <li>
          <button className={linkStyle} onClick={handleLogoutClick}>
            로그아웃
          </button>
        </li>
        {userType === "employee" && (
          <li className="tablet:relative">
            <button ref={btnRef} aria-label="알림 열기" className="flex" onClick={handleNoticeToggle}>
              <IcNotice className={cn("w-20 tablet:w-24", hasUnread ? "text-[#00aaaa]" : "text-black")} />
            </button>
            {isNoticeOpen && <NotificationWrapper onClose={handleNoticeClose} btnRef={btnRef} />}
          </li>
        )}
      </ul>
    </nav>
  );
};
export default UserHeader;
