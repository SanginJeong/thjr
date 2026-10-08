import { Html, Head, Main, NextScript } from "next/document";

// 인증 정보가 localStorage 에만 있어 서버는 사용자를 알 수 없다.
// <head> 의 인라인 스크립트는 body 를 그리기 전에 실행되므로, 여기서 보호 페이지를 걸러
// 정적 셸(스켈레톤)이 잠깐 보였다가 리다이렉트되는 깜빡임을 없앤다.
// 각 페이지의 useEffect 가드와 같은 규칙을 유지할 것 (클라이언트 내비게이션은 그쪽이 담당).
const AUTH_GATE_SCRIPT = `(function () {
  try {
    var path = location.pathname.replace(/\\/+$/, "") || "/";
    var userId = localStorage.getItem("userId");
    var userType = localStorage.getItem("userType");
    var target = null;

    if (path === "/profile" || path === "/profile/register") {
      if (!userId) target = "/signin";
    } else if (path === "/employer/shops") {
      if (!userId || userType !== "employer") target = "/signin";
    } else if (path === "/employer/shops/register") {
      if (!userId) target = "/signin";
      else if (userType !== "employer") target = "/joblist";
    }

    if (target) location.replace(target);
  } catch (e) {}
})();`;

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script dangerouslySetInnerHTML={{ __html: AUTH_GATE_SCRIPT }} />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
