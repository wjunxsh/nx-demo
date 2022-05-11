import React from "react";
import dynamic from 'next/dynamic'

import type { GetServerSidePropsContext } from 'next/types'
import type { AppProps } from 'next/app'

const Components = dynamic(() => import('../components'), { ssr: false })

export function Main(props: AppProps) {
  return <Components {...props} />
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


export default Main;
