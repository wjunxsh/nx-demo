import '../styles/globals.css'
import type { AppProps } from 'next/app'
import type { GetServerSidePropsContext } from 'next/types'
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>New App</title>
      </Head>
      <main className="app">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const shop = ctx.query.shop;
  if (shop) {
    ctx.res.setHeader(
      "Content-Security-Policy",
      `frame-ancestors https://${shop} https://admin.shopify.com;`
    );
  } else {
    ctx.res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`);
  }
  return {
    props: {}
  }
}

export default MyApp
