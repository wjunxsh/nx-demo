import Shopify, { DataType } from '@shopify/shopify-api';
import * as express from 'express';

import {
  RedisStorage, DatabaseStorage, Logger, ControllerBase, ControllerBaseInterface,
  ShopifyShopEntity, ShopifyShopAuthEntity, ShopifyUserEntity, ShopifyUserShopEntity,
  utilsDelay, utilsRandom,
} from '@ankershopifyapps/shared';

import {
  ShopifyClient
} from './index';

describe('shopify.queue', () => {

  const database = new DatabaseStorage([ShopifyShopEntity, ShopifyShopAuthEntity, ShopifyUserEntity, ShopifyUserShopEntity]);
  const redis = new RedisStorage();
  // 把日志写到文件里
  const logger = new Logger({ env: "production", level: "debug" });

  const controller = new ControllerBase({ Database: database, Redis: redis, Logger: logger } as ControllerBaseInterface);
  const client = new ShopifyClient(controller);

  const shop = "ankerjoedev1.myshopify.com";

  const graphqlShop = `{
    shop {
      name
    }}`;

  it('base', async () => {
    await database.initialize();
    expect(true).toEqual(true);
  });

  it('queue pressure test', async () => {

    let maxCount = 100;

    let count = 0;
    let countGraphql = 0;
    let countStorefront = 0;
    let startTime = Date.now();
    let restTime, graphqlTime, storefrontTime;

    await client.register(shop);

    for (let i = 0; i < maxCount; i++) {
      client.get(shop, { path: `shop`, query: {} }).then((resData) => {
        count++;
        logger.info(`client count: ${count}/${maxCount} index:${i}  ${resData.shop.name}`);
        if (count == maxCount) {
          restTime = Date.now();
        }
      }).catch((err) => {
        logger.error(`client count: ${count}/${maxCount} index:${i}, ${JSON.stringify(err)}`);
      });
    }
    
    for (let i = 0; i < maxCount; i++) {
      client.graphql(shop, { data: graphqlShop }).then((resData) => {
        countGraphql++;
        logger.info(`graphql client count: ${countGraphql}/${maxCount} index:${i}  ${resData.shop.name}`);
        if (countGraphql == maxCount) {
          graphqlTime = Date.now();
        }
      }).catch((err) => {
        logger.error(`graphql client count: ${countGraphql}/${maxCount} index:${i}, ${JSON.stringify(err)}`);
      });
    }

    for (let i = 0; i < maxCount; i++) {
      client.storefront(shop, { data: graphqlShop }).then((resData) => {
        countStorefront++;
        logger.info(`storefront client count: ${countStorefront}/${maxCount} index:${i}  ${resData.shop.name}`);
        if (countStorefront == maxCount) {
          storefrontTime = Date.now();
        }
      }).catch((err) => {
        logger.error(`storefront client count: ${countStorefront}/${maxCount} index:${i}, ${JSON.stringify(err)}`);
      });
    }

    await utilsDelay(3000);

    for (let i = 0; i < maxCount; i++) {
      await utilsDelay(1000);
      const sTime = Date.now();
      try {
        const resData = await client.lifoGet(shop, { path: `shop`, query: {} });
        logger.info(`lifoGet client index:${i} diff:${Date.now() - sTime} ${resData.shop.name}`);
      } catch (err) {
        logger.error(`lifoGet client index:[${i}], ${JSON.stringify(err)}`);
      }
    }

    logger.info(`Client run count: ${maxCount} restTime：${restTime - startTime}, graphqlTime: ${graphqlTime - startTime} , storefrontTime：${storefrontTime - startTime}`);
    expect("shopify.client").toEqual('shopify.client');

  }, 60 * 60 * 1000);
});

