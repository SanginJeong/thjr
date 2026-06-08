import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider, HydrationBoundary } from "@tanstack/react-query";
import { useState } from "react";
import { NextPage } from "next";
import { ReactNode } from "react";
import { ModalProvider } from "@/hooks/useModal";
import { Noto_Sans_KR } from "next/font/google";
import { AuthContextProvider } from "@/hooks/useAuth";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-sans",
  preload: false,
});

type NextPageWithLayout = NextPage & {
  getLayout: (page: ReactNode) => ReactNode;
};

export default function App({ Component, pageProps }: AppProps & { Component: NextPageWithLayout }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  const getLayout = Component.getLayout ?? ((page: ReactNode) => page);
  return (
    <div className={notoSansKR.variable}>
      <QueryClientProvider client={queryClient}>
        <AuthContextProvider>
          <ModalProvider>
            <HydrationBoundary state={pageProps.dehydratedState}>
              {getLayout(<Component {...pageProps} />)}
            </HydrationBoundary>
          </ModalProvider>
        </AuthContextProvider>
      </QueryClientProvider>
    </div>
  );
}
