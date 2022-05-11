import React from "react";
import dynamic from 'next/dynamic'

const Components = dynamic(() => import('./components'), { ssr: false })

export function Main(props:any) {
  return <Components {...props} />
}

export default Main;
