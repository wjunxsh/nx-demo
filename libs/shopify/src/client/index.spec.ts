import Shopify, { DataType } from '@shopify/shopify-api';

import {
  RedisStorage, DatabaseStorage, Logger, ControllerBase, ControllerBaseInterface,
  ShopifyShopEntity, ShopifyShopAuthEntity, ShopifyUserEntity, ShopifyUserShopEntity,
  utilsDelay, utilsRandom,
} from '@ankershopifyapps/shared';

import {
  ShopifyClient
} from './index';


describe('shopify.client', () => {

  const database = new DatabaseStorage([ShopifyShopEntity, ShopifyShopAuthEntity, ShopifyUserEntity, ShopifyUserShopEntity]);
  const redis = new RedisStorage();
  const logger = new Logger();

  const controller = new ControllerBase({ App:null, Database: database, Redis: redis, Logger: logger } as ControllerBaseInterface);
  const client = new ShopifyClient(controller);

  const productTitle = "Burton Custom Freestyle";
  let productId = 0;

  const shop = "ankerjoedev1.myshopify.com";

  const graphqlShop = `{
    shop {
      name
    }}`;


  it('base', async () => {

    await database.initialize();
    let resData = await client.get(shop, { path: `shop`, query: {} })
    expect(resData.shop.name).toEqual('ankerjoedev1');
  });


  it('Create a new product', async () => {
    let resData = await client.post(shop, { path: "products", data: { "product": { "title": productTitle, "body_html": "<strong>Good snowboard!</strong>", "vendor": "Burton", "product_type": "Snowboard", "tags": ["Barnes & Noble", "Big Air", "John's Fav"] } }, type: DataType.JSON });
    productId = resData.product.id;
    expect(resData.product.title).toEqual(productTitle);
    expect(productId).toBeGreaterThanOrEqual(1);
  });

  it('Retrieve a list of products', async () => {
    let resListData = await client.get(shop, { path: `products`, query: { "ids": productId } })
    expect(resListData.products.length).toBeGreaterThanOrEqual(1);
    expect(resListData.products[0].id).toEqual(productId);
  });

  it('Retrieve a single product', async () => {
    let resData = await client.get(shop, { path: `products/${productId}`, query: {} });
    expect(resData.product.id).toBeGreaterThanOrEqual(productId);
  });

  it('Retrieve a count of products', async () => {
    let resData = await client.get(shop, { path: `products/count`, query: {} });
    expect(resData.count).toBeGreaterThanOrEqual(1);
  });

  it('Updates a product', async () => {
    let resData = await client.put(shop, { path: `products/${productId}`, query: {}, data: { product: { title: "update Title" } }, type: DataType.JSON })
    expect(resData.product.title).toEqual("update Title");
  });

  it('Delete a product', async () => {
    let resData = await client.delete(shop, { path: `products/${productId}`, query: {}, type: DataType.JSON })
    expect(resData).toEqual({});
  });

  it('graphql', async () => {
    let resData = await client.graphql(shop, { data: graphqlShop })
    expect(resData.shop.name).toEqual("ankerjoedev1");
  });

  it('storefront', async () => {
    let resData = await client.storefront(shop, { data: graphqlShop })
    expect(resData.shop.name).toEqual("ankerjoedev1");
  });


});


// 




// let resData = await client.storefront(shop, {
//   data: `
//       {
//         shop {
//           name
//         }
//       }` })
// console.log("client res:", resData.shop.name);





// client.get(shop, { path: `shop`, query: {} }).then((resData) => {
//   console.log("client res:", resData.shop.name);
// }).catch((err) => {
//   console.log("client err:", err);
// });



// ???????????????
// let count = 0;
// let maxCount = 10000;

// ????????????
// await client.register(shop);

// ????????????   redis ???????????????????????????
// for (let i = 0; i < maxCount; i++) {
//   client.backstageGet(shop, { path: `shop`, query: {} }).then((resData) => {
//     count++;
//     this.Logger.debug(`client count: ${count}/${maxCount} index:${i}  ${resData.shop.name}`);
//   }).catch((err) => {
//     this.Logger.error(`client count: ${count}/${maxCount} index:${i}, ${JSON.stringify(err)}`);
//   });
// }


// ????????????   ?????????????????????????????????????????? ?????????????????????????????????
// for (let i = 0; i < maxCount; i++) {
//   client.get(shop, { path: `shop`, query: {} }).then((resData) => {
//     count++;
//     this.Logger.debug(`client count: ${count}/${maxCount} index:${i}  ${resData.shop.name}`);
//   }).catch((err) => {
//     this.Logger.error(`client count: ${count}/${maxCount} index:${i}, ${JSON.stringify(err)}`);
//   });
// }

// ???????????? graphql ??????
// for (let i = 0; i < maxCount; i++) {
//   client.graphql(shop, {
//     data: `
//       {
//         shop {
//           name
//         }
//       }` }).then((resData) => {
//       count++;
//       this.Logger.debug(`graphql client count: ${count}/${maxCount} index:${i}  ${resData.shop.name}`);
//     }).catch((err) => {
//       this.Logger.error(`graphql client count: ${count}/${maxCount} index:${i}, ${JSON.stringify(err)}`);
//     });
// }


// ????????????????????????
// for (let i = 0; i < maxCount; i++) {
//   client.storefront(shop, {
//     data: `
//   {
//     shop {
//       name
//     }
//   }` }).then((resData) => {
//       count++;
//       this.Logger.debug(`client count: ${count}/${maxCount} index:${i}  ${resData.shop.name}`);
//     }).catch((err) => {
//       this.Logger.error(`client count: ${count}/${maxCount} index:${i}, ${JSON.stringify(err)}`);
//     });
// }


// ????????????????????????
// await utilsDelay(10000);

// for (let i = 0; i < maxCount; i++) {
//   await utilsDelay(3000);
//   const sTime = Date.now();
//   try {
//     const resData = await client.lifoGet(shop, { path: `shop`, query: {} });
//     this.Logger.debug(`lifoGet  =========> client index:${i} diff:${Date.now() - sTime} ${resData.shop.name}`);
//   } catch (err) {
//     this.Logger.error(`lifoGet  =========>  client index:[${i}], ${JSON.stringify(err)}`);
//   }
// }

