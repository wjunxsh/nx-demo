import React, { useMemo, useEffect, useCallback, useState } from "react";
import { Outlet } from "react-router-dom";
import {
  Provider as AppBridgeProvider,
  useAppBridge,
} from "@shopify/app-bridge-react";

import { AppProvider } from "@shopify/polaris";

import translations from "@shopify/polaris/locales/en.json";
import { Link } from "@shopify/polaris";
import { Provider as StoresProvider, StoreProvider } from "../../stores/index";

import { useNavigate, useParams, useLocation } from "react-router-dom";

import "@shopify/polaris/build/esm/styles.css";
import "./base.module.less";

import { Base64Decode } from "../../utils/tools/base64";
import { getItem, setItem } from "../../utils/tools/local.storage";

// import MainPage from '../main'
import { CustomComponents, EmbeddedComponents } from '../auth'

import request from '../../utils/request';


export function LayoutBase() {

  const navigate = useNavigate();
  const location = useLocation()
  const params:any = new URL(window.location as any).searchParams;
  const [sign, setSign] = useState(undefined);

  const initializeSign = useCallback(async () => {
    let sign;
    if (params.get("sign")) {
      sign = Base64Decode(params.get("sign"));
      try {
        sign = JSON.parse(sign);
      } catch (e) { console.log("sign error"); }
      await setItem("s", sign);
    } else {
      sign = await getItem("s");
    }
    if (sign && sign["key"] && sign["host"] && sign["t"] && sign["t"] >= Date.now()) {
      setSign(sign);
      if (location.pathname === "/") {
        navigate("/main");
      }
    } else {
      if (location.pathname !== "/") {
        if (sign["host"] && sign["shop"]) {
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
  }, []);

  useEffect(() => {
    initializeSign()
  }, []);

  if (sign && sign["host"] && sign["key"]) {
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
      if (params.get("host") && params.get("shop")) {
        return (
          <AppProvider i18n={translations} linkComponent={Link}>
            <AppBridgeProvider
              config={{
                host: params.get("host"),
                apiKey: sign["api_key"],
                // apiKey: "5c722dfe29c02dab446a07f68b73d086",
                forceRedirect: true,
              }}
            >
              <EmbeddedComponents />
            </AppBridgeProvider>
          </AppProvider>
        );
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
}

export default LayoutBase;
