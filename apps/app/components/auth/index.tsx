import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  Toast,
  TextField,
  FormLayout,
  Form,
  Button,
  Frame
} from "@shopify/polaris";

import * as Redirect from "@shopify/app-bridge/actions/Navigation/Redirect"

import {
  useAppBridge
} from "@shopify/app-bridge-react";

import styles from "./index.module.less";


// https://a.com/?shop=ankerjoedev1.myshopify.com

// https://ankerjoedev1.myshopify.com/admin/apps
// https://ankerjoedev1.myshopify.com/admin/apps/joe_dev1

export function HomeComponents() {
  return <></>
}

export function CustomComponents() {

  const params = new URL(window.location.toString()).searchParams;

  const [value, setValue] = useState(params.get("shop") || "");
  const [active, setActive] = useState("请绑定外网域名");

  const handleChange = useCallback((newValue: string) => setValue(newValue), []);
  const handleSubmit = useCallback(() => {
    if (window.location.host.indexOf("127.0.0.1") < 0 && window.location.host.indexOf("localhost") < 0) {
      if (value.indexOf("myshopify.com") > 0) {
        window.location.href = `/auth/online?shop=${value}`
      } else {
        setActive("Please enter the correct store address such as： example.myshopify.com")
      }
    } else {
      setActive("Please bind an external domain name")
    }
  }, [value]);

  return (
    <Frame>
      <div className={styles.main}>
        <div className={styles.card}>

          <Card sectioned title="My Shopify App">
            <Form onSubmit={handleSubmit}>
              <FormLayout>
                <TextField
                  label="Enter your shop domain to log in or install this app."
                  value={value}
                  placeholder="example.myshopify.com"
                  onChange={handleChange}
                  autoComplete="off"
                  disabled={params.get("shop") != null}
                />
                <Button primary submit>Install app</Button>
              </FormLayout>
            </Form>
          </Card>
        </div>
      </div>
      {active != "" ? (
        <Toast content={active} onDismiss={() => { setActive("") }} />
      ) : null}
    </Frame>
  );
}


export function EmbeddedComponents() {
  const app = useAppBridge();
  const redirect = Redirect.create(app);

  const params = new URL(window.location.toString()).searchParams;

  useEffect(() => {
    redirect.dispatch(Redirect.Action.REMOTE, {
      url: `${app.localOrigin}/auth/online?shop=${params.get("shop")}`,
      newContext: false,
    });
  }, [app, redirect]);

  return (
    <div className={styles.main}>
      Authorization verification ...
    </div>
  );
}

export default HomeComponents;
