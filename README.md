# The Julge — 리팩토링

부트캠프 팀 프로젝트로 만든 알바 공고 플랫폼을 혼자 리팩토링한 프로젝트입니다.

> 기존 결과물: https://thejulge-mauve.vercel.app

---

## 리팩토링 동기

기존 프로젝트의 Lighthouse 측정 결과, 성능 지표가 사용자 경험 기준에 크게 못 미쳤습니다.

프록시가 존재한 이유는 `accessToken`을 **HttpOnly 쿠키**로 저장해 XSS를 방어하면서, `SameSite=Strict` 정책을 우회하기 위한 의도된 설계였습니다. 하지만 이 구조를 유지하려면 인증이 필요한 모든 요청을 프록시로 라우팅해야 했고, 속도 저하가 고정 비용으로 따라왔습니다.

---

## 핵심 결정: 인증 전략을 localStorage로 전환

프록시 구조의 보안 이득을 다시 평가했습니다.

**HttpOnly 쿠키의 장점**은 JS로 토큰 값 자체를 읽을 수 없다는 점입니다. 그러나 이 프로젝트는 **refreshToken이 없는 단일 accessToken 구조**입니다. XSS로 토큰이 탈취되면 만료 전까지 막을 방법이 없고, HttpOnly 쿠키가 주는 추가 보안 이득은 제한적이었습니다.

반면 프록시 유지의 비용은 명확했습니다: 모든 API 응답에 ~480ms의 고정 지연이 붙고, SSR 페이지에서도 공개 데이터를 서버에서 직접 가져올 수 없었습니다.

결론: **accessToken을 localStorage에 저장하고, 프록시를 제거**합니다.

```typescript
// src/lib/axios.ts — 인터셉터에서 localStorage 토큰 자동 주입
apiInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

이 결정은 두 가지 연쇄 변화를 가져왔습니다.

1. 공개 API는 서버에서도 토큰 없이 직접 호출할 수 있게 됐습니다 → **SSR Prefetch 적용 가능**
2. 인증 페이지는 서버에서 localStorage에 접근할 수 없습니다 → **CSR로 전환 필요**

---

## 페이지별 렌더링 전략

localStorage는 서버에서 읽을 수 없으므로, 인증 여부에 따라 렌더링 방식을 분리했습니다.

```
토큰이 필요한가?
├── No  → 공개 페이지 → SSR + TanStack Query Prefetch
└── Yes → 인증 페이지 → CSR + isMounted 패턴
```

### 공개 페이지 — SSR Prefetch

공고 목록(`/joblist`)과 공고 상세(`/jobinfo`)는 인증 없이 접근 가능한 공개 데이터입니다. `getServerSideProps`에서 TanStack Query 캐시를 미리 채워 클라이언트에 전달합니다. 사용자는 로딩 스피너 없이 데이터가 채워진 화면을 바로 봅니다.

```typescript
export const getServerSideProps = async (context) => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["getNotices", params],
    queryFn: () => getNotices(params),
  });

  return {
    props: { dehydratedState: dehydrate(queryClient) },
  };
};
```

**queryKey 일치 문제**: 공고 상세 페이지에서 `getServerSideProps`가 `context.params`의 키를 소문자(`shopid`, `noticeid`)로 읽어 prefetch했지만, 클라이언트 hook은 카멜케이스(`shopId`, `noticeId`)를 사용하고 있었습니다. 키가 달라 hydration 후 항상 캐시 미스가 발생해 prefetch 효과가 전혀 없었습니다. `context.params?.shopId`처럼 올바른 키로 읽도록 수정해 캐시가 정상적으로 재사용되게 했습니다.

**공고 목록 독립 렌더링**: 기존엔 맞춤 공고(로그인 사용자 주소 기반)와 전체 공고 데이터를 페이지가 모두 fetch해, 셋 중 하나라도 로딩 중이면 페이지 전체가 스켈레톤을 보여줬습니다. 맞춤 공고 컴포넌트가 자체적으로 데이터를 fetch하도록 분리해, 전체 공고는 SSR로 즉시 렌더링되고 맞춤 공고는 독립적으로 로딩됩니다.

### 인증 페이지 — CSR + isMounted

가게 관리(`/employer/shops`), 프로필(`/profile`) 등 토큰이 필요한 페이지는 CSR로 구현합니다. SSR에서 `checkAuth`로 쿠키를 읽어 리다이렉트하던 방식을 제거하고, 클라이언트 마운트 후 `useAuth()`로 인증 상태를 확인합니다.

`isMounted` 패턴은 hydration 전에 서버 렌더 결과와 클라이언트 상태가 달라 생기는 깜빡임(flash)을 차단합니다.

```typescript
const ShopInfo = () => {
  const { userId, userType } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!userId || userType !== "employer") {
      router.replace("/signin");
    }
  }, [mounted, userId, userType]);

  if (!mounted) return null; // 깜빡임 차단
};
```

### 전역 인증 상태 — AuthContext

기존에는 페이지마다 localStorage를 직접 읽어 인증 상태를 관리했습니다. 로그인/로그아웃 후 상태 변경이 즉시 반영되지 않고, 같은 읽기 로직이 여러 곳에 중복됐습니다.

`AuthContextProvider`로 앱 전체를 감싸 인증 상태를 전역 관리하고, 로그인/로그아웃 mutation의 `onSuccess`에서 `refreshAuth()`를 호출해 Context를 즉시 갱신합니다.

```typescript
// 로그인 mutation
onSuccess: (data) => {
  localStorage.setItem('token', data.token);
  refreshAuth(); // Context 즉시 갱신 → 헤더 메뉴 즉시 교체
  router.push('/');
},
```

---

## 페이지별 렌더링 전략 요약

| 페이지                         | 렌더링       | 이유                                |
| ------------------------------ | ------------ | ----------------------------------- |
| `/` (랜딩)                     | SSG          | 정적 콘텐츠, 공개                   |
| `/joblist`                     | SSR Prefetch | SEO + 초기 로딩 없이 공고 목록 표시 |
| `/jobinfo/[shopid]/[noticeid]` | SSR Prefetch | SEO + 즉시 공고 상세 렌더링         |
| `/signin`, `/signup`           | SSG          | 정적, 인증 불필요                   |
| `/profile`                     | CSR          | localStorage 토큰 필요              |
| `/employer/shops`              | CSR          | 고용주 인증 필요                    |

---

## 주요 개선 사항

### API 직접 호출 전환

모든 API hook에서 Vercel 서버리스 함수(`/api/proxy/*`)를 경유하던 방식을 `apiInstance` 직접 호출로 교체했습니다.

| 방식                       | 평균 응답시간 |
| -------------------------- | ------------- |
| 기존 (Vercel 프록시 경유)  | 673ms         |
| 변경 후 (백엔드 직접 호출) | ~194ms        |

### 폰트 시스템 교체

CDN `@import`로 불러오던 Spoqa Han Sans Neo(357KB)를 `next/font`로 교체했습니다. 빌드 타임 최적화, 레이아웃 시프트 방지, 사전 로딩을 자동으로 처리합니다.

```typescript
// pages/_app.tsx
import { Noto_Sans_KR } from "next/font/google";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-sans",
});
```

### 쿼리 무효화 수정

가게 정보·공고 등록/수정 후 `new QueryClient()`를 생성하는 코드가 있어 앱 전체 캐시 인스턴스와 분리되어 있었습니다. `useQueryClient()`로 교체하고 관련 쿼리를 명시적으로 무효화해 화면이 즉시 갱신되도록 수정했습니다.

### 라우팅 구조 정리

고용주 전용 기능의 경로를 `/shopinfo`, `/employer/jobinfo` 등으로 분산되어 있던 것을 `/employer/shops/**`로 통일했습니다.

---

## 기술 스택

- **Framework**: Next.js (Pages Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Server State**: TanStack Query v5
- **HTTP Client**: Axios
- **Font**: next/font (Noto Sans KR)
