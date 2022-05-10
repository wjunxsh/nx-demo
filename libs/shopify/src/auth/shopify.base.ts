import 'dotenv/config';

import Shopify, { ApiVersion } from '@shopify/shopify-api';
import {
  ControllerBase, ControllerBaseInterface,
} from '@ankershopifyapps/shared';

import { Response, Request } from 'express';

export class ShopifyBaseController extends ControllerBase {

  private isOnline = true;

  constructor(bootstrap: ControllerBaseInterface) {
    super(bootstrap);
    this.initial();
  }
  
  private async initial() {
    this.Router.post('/shopify/graphql', this.verifyRequest(this.App), this.authBase.bind(this));
    this.Router.get('/shopify/products-count', this.verifyRequest(this.App), this.productsCount.bind(this));
  }

  private async authBase(req: Request, res: Response) {
    try {
      const response = await Shopify.Utils.graphqlProxy(req, res);
      res.status(200).send(response.body);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  private async productsCount(req: Request, res: Response) {
    const session = await Shopify.Utils.loadCurrentSession(req, res, true);
    
    // session.accessToken
    // const { Product } = await import(`@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`);
    // const { Product } = await eval(`import("${`@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`}")`)
    const { Product, Shop } = await import(`@shopify/shopify-api/dist/rest-resources/2022-04/index.js`);
    const countData = await Product.count({ session });
    const shop = await Shop.all({ session });
    res.status(200).send(countData);
  }

}