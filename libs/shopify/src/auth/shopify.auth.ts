import 'dotenv/config';

import Shopify, { ApiVersion } from '@shopify/shopify-api';
import {
  ControllerBase, ControllerBaseInterface,
  ShopifyShopEntity, ShopifyShopAuthEntity, ShopifyUserEntity, ShopifyUserShopEntity, Base64Encode
} from '@ankershopifyapps/shared';

import { Response, Request } from 'express';

export class ShopifyAuthController extends ControllerBase {

  private isOnline = true;

  constructor(bootstrap: ControllerBaseInterface) {
    super(bootstrap)
    this.initial();
  }

  private async initial() {

    this.App.use((req, res, next) => {
      const shop = req.query.shop;
      if (true && shop) {
        res.setHeader(
          "Content-Security-Policy",
          `frame-ancestors https://${shop} https://admin.shopify.com;`
        );
      } else {
        res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`);
      }
      next();
    });

    this.Router.get('/auth/base', this.authBase.bind(this));
    this.Router.get('/auth/state', this.authState.bind(this));
    // https://dev1.ununn.com/auth/online?shop=ankerjoedev1.myshopify.com
    this.Router.get('/auth/online', this.authOnline.bind(this));
    // https://dev1.ununn.com/auth/offline?shop=ankerjoedev1.myshopify.com
    this.Router.get('/auth/offline', this.authOffline.bind(this));
    this.Router.get('/auth/online/callback', this.authOnlineCallback.bind(this));
    this.Router.get('/auth/offline/callback', this.authOfflineCallback.bind(this));
  }

  private async authBase(req: Request, res: Response) {
    return res.json({ data: { api_key: Shopify.Context.API_KEY }, code: 200 });
  }

  private async authState(req: Request, res: Response) {
    const session = await Shopify.Utils.loadCurrentSession(req, res, this.isOnline);
    if (session === undefined) {
      // return res.redirect(`/auth/login?shop=${req.query.shop}`);
      return res.json({ ok: false });
    } else {
      return res.json({ ok: true });
    }
  }

  private async authOnline(req: Request, res: Response) {
    if (req.query.shop) {
      const authRoute = await Shopify.Auth.beginAuth(
        req,
        res,
        req.query.shop.toString(),
        '/auth/online/callback',
        true
      );
      switch (req.query.type) {
        case "json":
          return res.json({ url: authRoute });
        default:
          return res.redirect(authRoute);
      }
    } else {
      // return res.redirect(`/auth/login?shop=${req.query.shop}`);
      return res.send("输入店铺地址");
    }
  }
  private async authOffline(req: Request, res: Response) {
    // console.log(req.query.shop);
    if (req.query.shop) {
      const authRoute = await Shopify.Auth.beginAuth(
        req,
        res,
        req.query.shop.toString(),
        '/auth/offline/callback',
        false
      );
      switch (req.query.type) {
        case "json":
          return res.json({ url: authRoute });
        default:
          return res.redirect(authRoute);
      }
    } else {
      // return res.redirect(`/auth/login?shop=${req.query.shop}`);
      return res.send("输入店铺地址");
    }

  }
  private async authOnlineCallback(req: Request, res: Response) {

    try {
      const session = await Shopify.Auth.validateAuthCallback(req, res, req.query as any);
      const shopAuthRepository = this.Database.getRepository(ShopifyShopAuthEntity);
      const findShopAuth = await shopAuthRepository.findOne({
        select: { id: true }, where: {
          shop_user_id: session.onlineAccessInfo.associated_user.id,
          shop: session.shop,
          is_online: true
        }
      });

      // const findShopAuth = findShopAuthList.filter((t) => t.isOnline == true)[0];
      if (findShopAuth == null) {

        const shopifyUserRepository = this.Database.getRepository(ShopifyUserEntity);
        const shopifyUserShopRepository = this.Database.getRepository(ShopifyUserShopEntity);

        const findUser = await shopifyUserRepository.findOne({ select: { id: true }, where: { id: session.onlineAccessInfo.associated_user.id } })
        if (findUser) {
          const findUserShop = await shopifyUserShopRepository.findOne({ select: { id: true }, where: { shopUserId: session.onlineAccessInfo.associated_user.id } })
          if (findUserShop) {
            findUserShop.account_owner = session.onlineAccessInfo.associated_user.account_owner;
            findUserShop.collaborator = session.onlineAccessInfo.associated_user.collaborator;
            await shopifyUserShopRepository.save(findUserShop);
          } else {
            const userShop = shopifyUserShopRepository.create();
            userShop.shopUserId = session.onlineAccessInfo.associated_user.id;
            userShop.shop = session.shop;
            userShop.account_owner = session.onlineAccessInfo.associated_user.account_owner;
            userShop.collaborator = session.onlineAccessInfo.associated_user.collaborator;
            await shopifyUserShopRepository.save(userShop);
          }
        } else {

          const user = shopifyUserRepository.create();
          user.id = session.onlineAccessInfo.associated_user.id;
          user.first_name = session.onlineAccessInfo.associated_user.first_name;
          user.last_name = session.onlineAccessInfo.associated_user.last_name;
          user.email = session.onlineAccessInfo.associated_user.email;
          user.email_verified = session.onlineAccessInfo.associated_user.email_verified;
          user.locale = session.onlineAccessInfo.associated_user.locale;

          await shopifyUserRepository.save(user);

          const userShop = shopifyUserShopRepository.create();
          userShop.shopUserId = session.onlineAccessInfo.associated_user.id;
          userShop.shop = session.shop;
          userShop.account_owner = session.onlineAccessInfo.associated_user.account_owner;
          userShop.collaborator = session.onlineAccessInfo.associated_user.collaborator;
          await shopifyUserShopRepository.save(userShop);

        }
        const shopAuth = shopAuthRepository.create();
        shopAuth.shop = session.shop;
        shopAuth.is_online = session.isOnline;
        shopAuth.scope = session.scope;
        shopAuth.expires = session.expires;
        shopAuth.access_token = session.accessToken;
        shopAuth.user_scope = session.onlineAccessInfo.associated_user_scope;
        shopAuth.shop_user_id = session.onlineAccessInfo.associated_user.id;
        shopAuthRepository.save(shopAuth);
      } else {
        findShopAuth.shop = session.shop;
        findShopAuth.is_online = session.isOnline;
        findShopAuth.scope = session.scope;
        findShopAuth.expires = session.expires;
        findShopAuth.access_token = session.accessToken;
        findShopAuth.user_scope = session.onlineAccessInfo.associated_user_scope;
        shopAuthRepository.save(findShopAuth);
      }

      const findOfflineShopAuth = await shopAuthRepository.findOne({
        select: { id: true }, where: {
          shop: session.shop,
          is_online: false
        }
      });

      if (findOfflineShopAuth == null) {
        return res.redirect(`/auth/offline?shop=${req.query.shop}`);
      } else {
        // return res.json({ key: Shopify.Context.API_KEY, host: req.query.host, t: session.expires.getTime() });
        return res.redirect(`/?sign=${Base64Encode(JSON.stringify({ key: Shopify.Context.API_KEY, host: req.query.host, t: session.expires.getTime() }))}`);
      }

    } catch (e) {
      switch (true) {
        case e instanceof Shopify.Errors.InvalidOAuthError:
          res.status(500);
          return res.json({ message: e.message });
        case e instanceof Shopify.Errors.CookieNotFound:
        case e instanceof Shopify.Errors.SessionNotFound:
          return res.redirect(`/auth/online?shop=${req.query.shop}`);
        default:
          return res.json({ message: e.message });
      }
    }
  }

  private async authOfflineCallback(req: Request, res: Response) {
    try {
      const session = await Shopify.Auth.validateAuthCallback(
        req,
        res,
        req.query as any
      );

      const shopAuthRepository = this.Database.getRepository(ShopifyShopAuthEntity);
      const findOfflineShopAuth = await shopAuthRepository.findOne({
        select: { id: true }, where: {
          shop: session.shop,
          is_online: false
        }
      });
      if (findOfflineShopAuth == null) {
        const shopAuth = shopAuthRepository.create();
        shopAuth.shop = session.shop;
        shopAuth.scope = session.scope;
        shopAuth.access_token = session.accessToken;
        shopAuth.is_online = session.isOnline;
        shopAuthRepository.save(shopAuth);
      } else {
        findOfflineShopAuth.shop = session.shop;
        findOfflineShopAuth.scope = session.scope;
        findOfflineShopAuth.access_token = session.accessToken;
        findOfflineShopAuth.is_online = session.isOnline;
        shopAuthRepository.save(findOfflineShopAuth);
      }

      // return res.json({ key: Shopify.Context.API_KEY, host: req.query.host, t: Date.now() + 23 * 60 * 60 * 1000 });
      return res.redirect(`/?sign=${Base64Encode(JSON.stringify({ key: Shopify.Context.API_KEY, host: req.query.host, t: Date.now() + 23 * 60 * 60 * 1000 }))}`);

    } catch (e) {
      // console.log("offline", e);
      // return res.json({ error: e });
      switch (true) {
        case e instanceof Shopify.Errors.InvalidOAuthError:
          res.status(500);
          return res.json({ message: e.message });
        case e instanceof Shopify.Errors.CookieNotFound:
        case e instanceof Shopify.Errors.SessionNotFound:
          return res.redirect(`/auth/offline?shop=${req.query.shop}`);
        default:
          return res.json({ message: e.message });
      }
    }
    return res.json({ ok: true });
  }
}