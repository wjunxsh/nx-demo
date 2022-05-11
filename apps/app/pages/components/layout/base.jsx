import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import {
  Provider as AppBridgeProvider,
} from "@shopify/app-bridge-react";
import { AppProvider } from "@shopify/polaris";
import translations from "@shopify/polaris/locales/en.json";
import { Link } from "@shopify/polaris";
import { Provider as StoresProvider, StoreProvider } from "../../../stores/index";

import { useNavigate, useLocation } from "react-router-dom";
import "@shopify/polaris/build/esm/styles.css";
import { Base64Decode } from "../../../utils/tools/base64";
import { getItem, setItem } from "../../../utils/tools/local.storage";

// import MainPage from '../main'
import { CustomComponents } from '../auth'

import request from '../../../utils/request';

export function LayoutBase(props) {

  const navigate = useNavigate();//跳转并设置state等信息
  const location = useLocation()//获取url的信息 或者state的信息
  const params = new URL(window.location).searchParams;
  const [sign, setSign] = useState(undefined);
  useEffect(() => {
    initializeSign()
  }, []);

  const initializeSign = async () => {
    let sign;
    if (params.get("sign")) {
      sign = Base64Decode(params.get("sign"));
      try {
        sign = JSON.parse(sign);
        await setItem("sign", sign);//将值放在本地的indexdb保存
      } catch (e) { console.log(e); }
    } else {
      sign = await getItem("sign");//将值放在本地的indexdb保存
    }

    if (sign && sign["key"] && sign["host"] && sign["t"] && sign["t"] >= Date.now()) {
      setSign(sign);
      if (location.pathname === "/") {
        navigate("/main");
      }
    } else {
      if (location.pathname !== "/") {
        if (sign && sign["host"] && sign["shop"]) {
          navigate(`/?host=${params.get("host")}&shop=${params.get("shop")}`);
        } else {
          navigate(`/`);
        }
      } else {
        let baseData = await getItem("base");
        if (baseData && baseData.api_key) {
          setSign(baseData);
        } else {
          baseData = await request.get("/auth/base");
          if (baseData.code == 200) {
            setSign(baseData.data);
            await setItem("base", baseData.data);
          }
        }
      }
    }
  }
  if (sign && sign["host"] && sign["key"]) {
    //AppBridgeProvider 设置了host 和key会自动更新为app的嵌入式显示
    return (
      <AppProvider i18n={translations} linkComponent={Link}>
        <AppBridgeProvider 
          
          config={{
            host: sign["host"],
            apiKey: sign["key"],
            forceRedirect: true,
          }}
        >
          
          <StoresProvider>
            <Outlet />
            </StoresProvider>
        </AppBridgeProvider>
      </AppProvider>
    );
  } else {
    if (sign === undefined) {
      return <>.....</>
    } else {
        return (
          <AppProvider i18n={translations} linkComponent={Link}>
            <StoreProvider>
              <CustomComponents />
            </StoreProvider>
          </AppProvider>
        );
    }
  }
}

export default LayoutBase;
