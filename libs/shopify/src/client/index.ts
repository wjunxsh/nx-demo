import 'dotenv/config';

import Shopify, { ApiVersion, GetRequestParams, PostRequestParams, PutRequestParams, DeleteRequestParams, GraphqlParams } from '@shopify/shopify-api';
import {
  ControllerBase, ControllerBaseInterface,
} from '@ankershopifyapps/shared';

import { Response, Request } from 'express';

import { Queue, Worker, QueueEvents, JobsOptions } from 'bullmq';
import { ShopifyClientQueue } from './queue';


export class ShopifyClient extends ControllerBase {

  private ClientQueue: ShopifyClientQueue;

  constructor(bootstrap: ControllerBaseInterface) {
    super(bootstrap);
    this.initial();
    this.ClientQueue = new ShopifyClientQueue(this);
  }

  private async initial() {
  }
  
  public async register(shop: string) {
    return new Promise(async (resolve: (value: any) => void, reject: (value: any) => void) => {
      await this.ClientQueue.register(resolve, reject, shop);
    });
  }

  public async get(shop: string, params: GetRequestParams, opts?: JobsOptions) {
    return new Promise(async (resolve: (value: any) => void, reject: (value: any) => void) => {
      await this.ClientQueue.add("restGet", resolve, reject, shop, params, opts);
    });
  }
  public async backstageGet(shop: string, params: GetRequestParams, opts?: JobsOptions) {
    return new Promise(async (resolve: (value: any) => void, reject: (value: any) => void) => {
      await this.ClientQueue.add("backstageRestGet", resolve, reject, shop, params, opts);
    });
  }
  public async lifoGet(shop: string, params: GetRequestParams, opts?: JobsOptions) {
    return new Promise(async (resolve: (value: any) => void, reject: (value: any) => void) => {
      await this.ClientQueue.add("restGet", resolve, reject, shop, params, { ...opts, lifo: true });
    });
  }
  

  public async post(shop: string, params: PostRequestParams, opts?: JobsOptions) {
    return new Promise(async (resolve: (value: any) => void, reject: (value: any) => void) => {
      await this.ClientQueue.add("restPost", resolve, reject, shop, params, opts);
    });
  }
  public async backstagePost(shop: string, params: PostRequestParams, opts?: JobsOptions) {
    return new Promise(async (resolve: (value: any) => void, reject: (value: any) => void) => {
      await this.ClientQueue.add("backstageRestPost", resolve, reject, shop, params, opts);
    });
  }
  public async lifoPost(shop: string, params: PostRequestParams, opts?: JobsOptions) {
    return new Promise(async (resolve: (value: any) => void, reject: (value: any) => void) => {
      await this.ClientQueue.add("restPost", resolve, reject, shop, params, { ...opts, lifo: true });
    });
  }
  


  public async put(shop: string, params: PutRequestParams, opts?: JobsOptions) {
    return new Promise(async (resolve: (value: any) => void, reject: (value: any) => void) => {
      await this.ClientQueue.add("restPut", resolve, reject, shop, params, opts);
    });
  }
  public async backstagePut(shop: string, params: PutRequestParams, opts?: JobsOptions) {
    return new Promise(async (resolve: (value: any) => void, reject: (value: any) => void) => {
      await this.ClientQueue.add("backstageRestPut", resolve, reject, shop, params, opts);
    });
  }
  public async lifoPut(shop: string, params: PutRequestParams, opts?: JobsOptions) {
    return new Promise(async (resolve: (value: any) => void, reject: (value: any) => void) => {
      await this.ClientQueue.add("restPut", resolve, reject, shop, params, { ...opts, lifo: true });
    });
  }

  public async delete(shop: string, params: DeleteRequestParams, opts?: JobsOptions) {
    return new Promise(async (resolve: (value: any) => void, reject: (value: any) => void) => {
      await this.ClientQueue.add("restDelete", resolve, reject, shop, params, opts);
    });
  }
  public async backstageDelete(shop: string, params: DeleteRequestParams, opts?: JobsOptions) {
    return new Promise(async (resolve: (value: any) => void, reject: (value: any) => void) => {
      await this.ClientQueue.add("backstageRestDelete", resolve, reject, shop, params, opts);
    });
  }
  public async lifoDelete(shop: string, params: DeleteRequestParams, opts?: JobsOptions) {
    return new Promise(async (resolve: (value: any) => void, reject: (value: any) => void) => {
      await this.ClientQueue.add("restDelete", resolve, reject, shop, params, { ...opts, lifo: true });
    });
  }

  public async graphql(shop: string, params: GraphqlParams, opts?: JobsOptions) {
    return new Promise(async (resolve: (value: any) => void, reject: (value: any) => void) => {
      await this.ClientQueue.add("graphql", resolve, reject, shop, params, opts);
    });
  }
  public async backstageGraphql(shop: string, params: GraphqlParams, opts?: JobsOptions) {
    return new Promise(async (resolve: (value: any) => void, reject: (value: any) => void) => {
      await this.ClientQueue.add("backstageGraphql", resolve, reject, shop, params, opts);
    });
  }
  public async lifoGraphql(shop: string, params: GraphqlParams, opts?: JobsOptions) {
    return new Promise(async (resolve: (value: any) => void, reject: (value: any) => void) => {
      await this.ClientQueue.add("graphql", resolve, reject, shop, params, { ...opts, lifo: true });
    });
  }

  public async storefront(shop: string, params: GraphqlParams, opts?: JobsOptions) {
    return new Promise(async (resolve: (value: any) => void, reject: (value: any) => void) => {
      await this.ClientQueue.add("storefront", resolve, reject, shop, params, opts);
    });
  }
  public async backstageStorefront(shop: string, params: GraphqlParams, opts?: JobsOptions) {
    return new Promise(async (resolve: (value: any) => void, reject: (value: any) => void) => {
      await this.ClientQueue.add("backstageStorefront", resolve, reject, shop, params, opts);
    });
  }
  public async lifoStorefront(shop: string, params: GraphqlParams, opts?: JobsOptions) {
    return new Promise(async (resolve: (value: any) => void, reject: (value: any) => void) => {
      await this.ClientQueue.add("storefront", resolve, reject, shop, params, { ...opts, lifo: true });
    });
  }

  
  public async graphqlTest(req: Request, res: Response) {

    const Rest = new Shopify.Clients.Rest(
      "shopInfo.shop", "shopInfo.access_token"
    );

    // Rest.get()
    // Rest.post()
    // Rest.put()
    // Rest.delete()

    const Graphql = new Shopify.Clients.Graphql(
      "shopInfo.shop", "shopInfo.access_token"
    );
    Graphql.query({ query: {}, data: "", extraHeaders: {} })

    const Storefront = new Shopify.Clients.Storefront(
      "shopInfo.shop", "shopInfo.access_token"
    );
    // Storefront.query()

  }

}