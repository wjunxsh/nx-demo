import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  Page,
  Layout,
  TextField,
  FormLayout,
  Form,
  Button
} from "@shopify/polaris";

import * as Redirect from "@shopify/app-bridge/actions/Navigation/Redirect"
import styles from "./index.module.less"
import {
  useAppBridge
} from "@shopify/app-bridge-react";


// https://dev1.ununn.com/?shop=ankerjoedev1.myshopify.com

// https://ankerjoedev1.myshopify.com/admin/apps
// https://ankerjoedev1.myshopify.com/admin/apps/joe_dev1

export function HomeComponents(props) {
  return <></>
}

export function CustomComponents(props) {

  const params = new URL(window.location.toString()).searchParams;
  const [value, setValue] = useState(params.get("shop") || "");
  const handleChange = (newValue) => {setValue(newValue)};
  const handleSubmit = (e) => {
    window.location.href = `/auth/online?shop=${value}`
  };

  return (
    <div className={styles.main}>
      <div className={styles.card}>
        <Card sectioned title="My Shopify App">
          <Form onSubmit={handleSubmit}>
            <FormLayout>
              <TextField
                label="Enter your shop domain to log in or install this app."
                value={value}
                placeholder="example.myshopify.coms"
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
  );
}


export function EmbeddedComponents(props) {
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
