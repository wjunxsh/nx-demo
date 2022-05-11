import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  Heading,
  TextContainer,
  DisplayText,
  TextStyle,
  Button,
} from "@shopify/polaris";
import { Toast, useAppBridge } from "@shopify/app-bridge-react";
import { gql, useMutation, useLazyQuery } from "@apollo/client";
import { userLoggedInFetch } from "../../../stores/index";

const PRODUCTS_QUERY = gql`
  mutation populateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        title
      }
    }
  }
`;

const SHOP = gql`
  query {
    shop {
      name
    }
  }
`;
function HomeComponents() {
  const [populateProduct, { loading }] = useMutation(PRODUCTS_QUERY);
  const [hasResults, setHasResults] = useState(false);

  const [getShop, ShopRes] = useLazyQuery(SHOP, { fetchPolicy: "no-cache" });
  console.log("ShopRes", ShopRes.data);
  useEffect(() => {
    getShop();
  }, []);

  const [productCount,setProductCount] = useState(0);
  const app = useAppBridge();
  const fetch = userLoggedInFetch(app);
  async function updateProductCount() {
    const { count } = await fetch("http://localhost:8080/shopify/products-count").then((res) =>{
      return res.json()
    });
    setProductCount(count);
  }

  useEffect(() => {
    updateProductCount();
  }, []);

  const toastMarkup = hasResults && (
    <Toast
      content="5 products created!"
      onDismiss={() => setHasResults(false)}
    />
  );

  return (
    <>
      {toastMarkup}
      <Card title="Product Counter" sectioned>
        <TextContainer spacing="loose">
          <p>
            Sample products are created with a default title and price. You can
            remove them at any time.
          </p>
          <Heading element="h4">
            TOTAL PRODUCTS
            <DisplayText size="medium">
              <TextStyle variation="strong">{productCount}</TextStyle>
            </DisplayText>
          </Heading>
          <Button
            primary
            loading={loading}
            onClick={() => {
              Promise.all(
                Array.from({ length: 5 }).map(() =>
                  populateProduct({
                    variables: {
                      input: {
                        title: randomTitle(),
                      },
                    },
                  })
                )
              ).then((data) => {
                console.log(data);
                console.log("dsfasdf----");
                updateProductCount();
                setHasResults(true);
              });
            }}
          >
            Populate 5 products
          </Button>
        </TextContainer>
      </Card>
    </>
  );
}

function randomTitle() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];

  return `${adjective} ${noun}`;
}

const ADJECTIVES = [
  "autumn",
  "hidden",
  "bitter",
  "misty",
  "silent",
  "empty",
  "dry",
  "dark",
  "summer",
  "icy",
  "delicate",
  "quiet",
  "white",
  "cool",
  "spring",
  "winter",
  "patient",
  "twilight",
  "dawn",
  "crimson",
  "wispy",
  "weathered",
  "blue",
  "billowing",
  "broken",
  "cold",
  "damp",
  "falling",
  "frosty",
  "green",
  "long",
  "late",
  "lingering",
  "bold",
  "little",
  "morning",
  "muddy",
  "old",
  "red",
  "rough",
  "still",
  "small",
  "sparkling",
  "throbbing",
  "shy",
  "wandering",
  "withered",
  "wild",
  "black",
  "young",
  "holy",
  "solitary",
  "fragrant",
  "aged",
  "snowy",
  "proud",
  "floral",
  "restless",
  "divine",
  "polished",
  "ancient",
  "purple",
  "lively",
  "nameless",
];

const NOUNS = [
  "waterfall",
  "river",
  "breeze",
  "moon",
  "rain",
  "wind",
  "sea",
  "morning",
  "snow",
  "lake",
  "sunset",
  "pine",
  "shadow",
  "leaf",
  "dawn",
  "glitter",
  "forest",
  "hill",
  "cloud",
  "meadow",
  "sun",
  "glade",
  "bird",
  "brook",
  "butterfly",
  "bush",
  "dew",
  "dust",
  "field",
  "fire",
  "flower",
  "firefly",
  "feather",
  "grass",
  "haze",
  "mountain",
  "night",
  "pond",
  "darkness",
  "snowflake",
  "silence",
  "sound",
  "sky",
  "shape",
  "surf",
  "thunder",
  "violet",
  "water",
  "wildflower",
  "wave",
  "water",
  "resonance",
  "sun",
  "wood",
  "dream",
  "cherry",
  "tree",
  "fog",
  "frost",
  "voice",
  "paper",
  "frog",
  "smoke",
  "star",
];

export default HomeComponents;
