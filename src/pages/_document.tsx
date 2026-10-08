import { Html, Head, Main, NextScript } from "next/document";
import { AUTH_GATE_SCRIPT } from "@/utils/authGuard";

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* 보호 페이지 하드 로드 가드: 규칙은 src/utils/authGuard.ts */}
        <script dangerouslySetInnerHTML={{ __html: AUTH_GATE_SCRIPT }} />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
