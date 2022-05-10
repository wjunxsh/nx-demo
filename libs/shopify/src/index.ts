import 'dotenv/config';
import Shopify, { ApiVersion, AuthQuery } from '@shopify/shopify-api';
import { Context } from '@shopify/shopify-api/dist/context';
import { ControllerBase, ControllerBaseInterface } from '@ankershopifyapps/shared';
import { ShopifyAuthController } from './auth/shopify.auth';
import { ShopifyBaseController } from './auth/shopify.base';
import { Express, Router } from 'express';

export * from './client';


const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

export class ShopifyController extends ControllerBase {

  constructor(bootstrap: ControllerBaseInterface) {
    super(bootstrap)
    this.initial();
    // 绑定授权
    this.Router.use(new ShopifyAuthController(this).Router);
    // 基础实现
    this.Router.use(new ShopifyBaseController(this).Router);
  }

  // 初始化Shopfiy
  private async initial() {
    Shopify.Context.initialize({
      API_KEY: process.env.API_KEY,
      API_SECRET_KEY: process.env.API_SECRET_KEY,
      SCOPES: [process.env.SCOPES],
      HOST_NAME: process.env.HOST.replace(/https:\/\//, ''),
      IS_EMBEDDED_APP: true,
      API_VERSION: ApiVersion.April22,
      // API_VERSION: ApiVersion.Unstable,
      // SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
      SESSION_STORAGE: new Shopify.Session.CustomSessionStorage(
        this.storeCallback.bind(this),
        this.loadCallback.bind(this),
        this.deleteCallback.bind(this)
      ),
    });
  }

  async storeCallback(session: { id: string }) {
    try {
      return await this.Redis.set(session.id, JSON.stringify(session));
    } catch (err) {
      throw new Error(err);
    }
  }

  async loadCallback(id: string) {
    try {
      const reply = await this.Redis.get(id);
      if (reply) {
        return JSON.parse(reply);
      }
      return undefined;
    } catch (err) {
      throw new Error(err);
    }
  }

  async deleteCallback(id: string) {
    try {
      return await this.Redis.del(id);
    } catch (err) {
      throw new Error(err);
    }
  }

  // shopify 嵌入授权校验  
  // TODO 授权模式需要优化， 官方为直接
  public verifyRequest(app: Express, { returnHeader = true } = {}): any {

    return async (req, res, next?: any) => {

      try {

        const session = await Shopify.Utils.loadCurrentSession(
          req,
          res,
          true
        );

        // console.log( "session: isActive >> ", session.isActive );
        // console.log( "session: accessToken >> ", session.accessToken );


        // if (session?.isActive()) {
        //   try {
        //     // make a request to make sure oauth has succeeded, retry otherwise
        //     const client = new Shopify.Clients.Graphql(
        //       session.shop,
        //       session.accessToken
        //     );
        //     await client.query({ data: TEST_GRAPHQL_QUERY });
        //     return next();
        //   } catch (e) {
        //     if (
        //       e instanceof Shopify.Errors.HttpResponseError &&
        //       e.response.code === 401
        //     ) {
        //       // We only want to catch 401s here, anything else should bubble up
        //     } else {
        //       throw e;
        //     }
        //   }
        // }

        if (session && session.accessToken) {
          return next();
        } else {
          return res
            .status(400)
            .send(
              `Could not find a shop to session with.`
            );
        }

      } catch (e) {

        return res
          .status(400)
          .send(
            `Could not find a shop to authenticate with. Make sure you are making your XHR request with App Bridge's authenticatedFetch method.`
          );

      }

      // if (session?.isActive()) {
      //   try {
      //     // make a request to make sure oauth has succeeded, retry otherwise
      //     const client = new Shopify.Clients.Graphql(
      //       session.shop,
      //       session.accessToken
      //     );
      //     await client.query({ data: TEST_GRAPHQL_QUERY });
      //     return next();
      //   } catch (e) {
      //     if (
      //       e instanceof Shopify.Errors.HttpResponseError &&
      //       e.response.code === 401
      //     ) {
      //       // We only want to catch 401s here, anything else should bubble up
      //     } else {
      //       throw e;
      //     }
      //   }
      // }

    }
  };
}