import 'dotenv/config';

import Shopify, {
  ApiVersion,
  GetRequestParams, PostRequestParams, PutRequestParams, DeleteRequestParams, GraphqlParams, RequestReturn,
  DataType
} from '@shopify/shopify-api';

import { RestClient } from '@shopify/shopify-api/dist/clients/rest';
import { Queue, Worker, JobsOptions, Job } from 'bullmq';

import {
  ControllerBase, ControllerBaseInterface,
  ShopifyShopAuthEntity,
  utilsDelay, utilsRandom
} from '@ankershopifyapps/shared';

export class ShopifyClientQueue extends ControllerBase {

  private QueueMapList: { [key: string]: Queue } = {};
  private QueueMapPromise: { [key: string]: { [key: string]: { resolve: (value: any) => void, reject: (value: any) => void } } } = {};

  private ShopCacheMapList: { [key: string]: { is_online: boolean, access_token: string, storefront_token: string, storefront_access_token: string, expires: Date, rest: RestClient } } = {};

  private SHOPIFY_RETRY: number = 30;
  private SHOPIFY_WORKER: number = 20;

  constructor(bootstrap: ControllerBaseInterface) {
    super(bootstrap);
    this.initial();
  }

  private async initial() {
    this.SHOPIFY_RETRY = process.env.SHOPIFY_RETRY ? parseInt(process.env.SHOPIFY_RETRY) : 60;
    this.SHOPIFY_WORKER = process.env.SHOPIFY_WORKER ? parseInt(process.env.SHOPIFY_WORKER) : 40;
  }

  private async registerQueue(shop: string, reject: (value: any) => void) {

    const shopCache = this.ShopCacheMapList[shop]
    if (!shopCache) {
      const shopAuthRepository = this.Database.getRepository(ShopifyShopAuthEntity);
      const findShopAuth = await shopAuthRepository.findOne({
        select: { shop: true, is_online: true, access_token: true, expires: true }, where: {
          shop: shop,
          is_online: false,
          is_storefront: false
        }
      });

      if (findShopAuth == null) {
        this.Logger.error(`queue registerQueue ${shop} Authorization does not exist`);
        reject("Authorization does not exist");
        return
      }

      const findStoreFrontAuth = await shopAuthRepository.findOne({
        select: { shop: true, is_online: true, access_token: true, token: true, expires: true }, where: {
          shop: shop,
          is_storefront: true
        }
      });

      this.ShopCacheMapList[shop] = {
        is_online: findShopAuth.is_online,
        access_token: findShopAuth.access_token,
        storefront_token: findStoreFrontAuth ? findStoreFrontAuth.token : "",
        storefront_access_token: findStoreFrontAuth ? findStoreFrontAuth.access_token : "",
        expires: findShopAuth.expires,
        rest: new Shopify.Clients.Rest(
          shop, findShopAuth.access_token
        )
      };
    }

    this.Logger.debug(`queue registerQueue ${shop}`, this.ShopCacheMapList[shop]);

    this.registerQueueExecute(`${shop}.rest`);
    this.registerQueueExecute(`${shop}.graphql`);
    this.registerQueueExecute(`${shop}.store`);

  }


  private async registerQueueExecute(queueName: string): Promise<Queue> {

    this.QueueMapList[queueName] = new Queue(queueName, { connection: this.Redis });
    try {
      await this.QueueMapList[queueName].drain();
      // await this.QueueMapList[queueName].obliterate();
      // await this.QueueMapList[queueName].obliterate({ force: true, count: 10000 });
    } catch (err) {
    }
    
    const workers = new Worker(queueName, async job => {
      const queueName = this.getQueueName(job.name, job.data.shop);
      if ((this.QueueMapPromise[queueName] && this.QueueMapPromise[queueName][job.id]) || job.name.indexOf("backstage") >= 0) {
        switch (job.name) {
          case 'backstageRestGet':
          case 'restGet':
            return await this.restGet(job.data.shop, job.data.data);
          case 'backstageRestPost':
          case 'restPost':
            return await this.restPost(job.data.shop, job.data.data);
          case 'backstageRestPut':
          case 'restPut':
            return await this.restPut(job.data.shop, job.data.data);
          case 'backstageRestDelete':
          case 'restDelete':
            return await this.restDelete(job.data.shop, job.data.data);
          case 'backstageGraphql':
          case 'graphql':
            return await this.graphql(job.data.shop, job.data.data);
          case 'backstageStorefront':
          case 'storefront':
            return await this.storefront(job.data.shop, job.data.data);
          default:
            return await Promise.reject("unrecognized action");
        }
      } else {
        this.Logger.warn(`drop queue ${job.name}`);
        return await Promise.resolve(`drop queue ${job.name}`);
      }

    }, { connection: this.Redis, concurrency: this.SHOPIFY_WORKER });

    workers.on('drained', async () => {
      try {
        // await this.QueueMapList[queueName].drain();
        // await this.QueueMapList[queueName].obliterate({ force: true, count: 10000 });
      } catch (err) {
      }
    });

    workers.on('completed', (job: Job) => {
      const queueName = this.getQueueName(job.name, job.data.shop);
      if (this.QueueMapPromise[queueName][job.id]) {
        this.Logger.debug(`queue completed ${job.data.shop}`);
        this.QueueMapPromise[queueName][job.id].resolve(job.returnvalue);
        delete this.QueueMapPromise[job.id];
        job.remove();
      }
    });

    workers.on('failed', (job: Job, err: Error) => {
      const queueName = this.getQueueName(job.name, job.data.shop);
      this.Logger.error(`queue failed ${job.data.shop}`, err);
      if (this.QueueMapPromise[queueName][job.id]) {
        this.QueueMapPromise[queueName][job.id].reject(err);
        delete this.QueueMapPromise[job.id];
        job.remove();
      }
    });

    return this.QueueMapList[queueName];

  }



  public async register(resolve: (value: any) => void, reject: (value: any) => void, shop: string) {
    let Queue: Queue = this.QueueMapList[shop];
    if (!Queue) {
      await this.registerQueue(shop, reject);
      resolve(true);
    }
  }

  public async add(apiType: string, resolve: (value: any) => void, reject: (value: any) => void, shop: string, data: GetRequestParams | PostRequestParams | PutRequestParams | DeleteRequestParams | GraphqlParams, opts?: JobsOptions) {
    const queueName = this.getQueueName(apiType, shop);
    let Queue: Queue = this.QueueMapList[queueName];
    if (!Queue) {
      await this.registerQueue(shop, reject);
      Queue = this.QueueMapList[queueName];
    }
    if (Queue) {
      this.Logger.debug(`queue add ${apiType} ${shop} `, this.ShopCacheMapList[shop]);
      const queueRes = await (await Queue.add(apiType, { shop, data }, opts));
      this.QueueMapPromise[queueName] = this.QueueMapPromise[queueName] || {};
      this.QueueMapPromise[queueName][queueRes.id] = { resolve, reject }
    }

  }

  private getQueueName(apiType: string, shop: string): string {

    let queueName: string = shop;
    switch (apiType) {
      case "restGet":
      case "backstageRestGet":
      case "restPost":
      case "backstageRestPost":
      case "restPut":
      case "backstageRestPut":
      case "restDelete":
      case "backstageRestDelete":
        queueName += ".rest";
        break;
      case "graphql":
      case "backstageGraphql":
        queueName += ".graphql";
        break;
      case "storefront":
      case "backstageStorefront":
        queueName += ".store";
        break;
      default:
        break;
    }
    return queueName;

  }

  private async restGet(shop: string, params: GetRequestParams, retryCount: number = 0) {
    const shopCache = this.ShopCacheMapList[shop];
    if (!shopCache) {
      return Promise.reject({ code: 500, message: "Store not authorized" });
    }
    try {
      const response: RequestReturn = await shopCache.rest.get(params);
      this.Logger.debug(`restGet ${shop} limit ${response.headers.get('x-shopify-shop-api-call-limit')}`);
      return response.body;
    } catch (err) {
      retryCount++;
      if (await this.errorProcess(shop, err, retryCount)) {
        if (retryCount <= this.SHOPIFY_RETRY) {
          await utilsDelay(1000)
          this.Logger.warn(`restGet ${shop} path【${params.path}】retry ${retryCount}/${this.SHOPIFY_RETRY}`)
          return await this.restGet(shop, params, retryCount);
        } else {
          return Promise.reject({ code: 429, message: `Maximum ${this.SHOPIFY_RETRY} of of retry Count` })
        }
      } else {
        return Promise.reject({ code: err.code, message: err.message })
      }
    }
  }

  private async restPost(shop: string, params: PostRequestParams, retryCount: number = 0) {
    const shopCache = this.ShopCacheMapList[shop];
    if (!shopCache) {
      return Promise.reject({ code: 500, message: "Store not authorized" });
    }
    try {
      const response: RequestReturn = await shopCache.rest.post(params);
      this.Logger.debug(`restPost ${shop} limit ${response.headers.get('x-shopify-shop-api-call-limit')}`);
      return response.body;
    } catch (err) {
      retryCount++;
      if (await this.errorProcess(shop, err, retryCount)) {
        if (retryCount <= this.SHOPIFY_RETRY) {
          await utilsDelay(1000)
          this.Logger.warn(`restPost ${shop} path【${params.path}】retry ${retryCount}/${this.SHOPIFY_RETRY}`)
          return await this.restPost(shop, params, retryCount);
        } else {
          return Promise.reject({ code: 429, message: `Maximum ${this.SHOPIFY_RETRY} of of retry Count` })
        }
      } else {
        return Promise.reject({ code: err.code, message: err.message })
      }
    }
  }

  private async restPut(shop: string, params: PutRequestParams, retryCount: number = 0) {
    const shopCache = this.ShopCacheMapList[shop];
    if (!shopCache) {
      return Promise.reject({ code: 500, message: "Store not authorized" });
    }
    try {
      const response: RequestReturn = await shopCache.rest.put(params);
      this.Logger.debug(`restPut ${shop} limit ${response.headers.get('x-shopify-shop-api-call-limit')}`);
      return response.body;
    } catch (err) {
      retryCount++;
      if (await this.errorProcess(shop, err, retryCount)) {
        if (retryCount <= this.SHOPIFY_RETRY) {
          await utilsDelay(1000)
          this.Logger.warn(`restPut ${shop} path【${params.path}】retry ${retryCount}/${this.SHOPIFY_RETRY}`)
          return await this.restPut(shop, params, retryCount);
        } else {
          return Promise.reject({ code: 429, message: `Maximum ${this.SHOPIFY_RETRY} of of retry Count` })
        }
      } else {
        return Promise.reject({ code: err.code, message: err.message })
      }
    }
  }

  private async restDelete(shop: string, params: DeleteRequestParams, retryCount: number = 0) {
    const shopCache = this.ShopCacheMapList[shop];
    if (!shopCache) {
      return Promise.reject({ code: 500, message: "Store not authorized" });
    }
    try {
      const response: RequestReturn = await shopCache.rest.delete(params);
      this.Logger.debug(`restDelete ${shop} limit ${response.headers.get('x-shopify-shop-api-call-limit')}`);
      return response.body;
    } catch (err) {
      retryCount++;
      if (await this.errorProcess(shop, err, retryCount)) {
        if (retryCount <= this.SHOPIFY_RETRY) {
          await utilsDelay(1000)
          this.Logger.warn(`restDelete ${shop} path【${params.path}】retry ${retryCount}/${this.SHOPIFY_RETRY}`);
          return await this.restDelete(shop, params, retryCount);
        } else {
          return Promise.reject({ code: 429, message: `Maximum ${this.SHOPIFY_RETRY} of of retry Count` })
        }
      } else {
        return Promise.reject({ code: err.code, message: err.message })
      }
    }
  }

  private async graphql(shop: string, params: GraphqlParams, retryCount: number = 0) {
    const shopCache = this.ShopCacheMapList[shop];
    if (!shopCache) {
      return Promise.reject({ code: 500, message: "Store not authorized" });
    }
    const graphql = new Shopify.Clients.Graphql(
      shop, shopCache.access_token
    );
    try {
      const response: RequestReturn = await graphql.query(params);
      const body: any = response.body;
      if (body.extensions && body.extensions.cost && body.extensions.cost.throttleStatus) {
        this.Logger.debug(`graphql ${shop} Cost:${body.extensions.cost.requestedQueryCost}/${body.extensions.cost.actualQueryCost} limit:${body.extensions.cost.throttleStatus.currentlyAvailable}/${body.extensions.cost.throttleStatus.maximumAvailable} restoreRate:${body.extensions.cost.throttleStatus.restoreRate}`);
      }
      return body ? body.data : body;
    } catch (err) {
      retryCount++;
      if (await this.errorProcess(shop, err, retryCount)) {
        if (retryCount <= this.SHOPIFY_RETRY) {
          this.Logger.warn(`graphql ${shop} data【${params.data}】retry ${retryCount}/${this.SHOPIFY_RETRY}`)
          return await this.graphql(shop, params, retryCount);
        } else {
          return Promise.reject({ code: 429, message: `Maximum ${this.SHOPIFY_RETRY} of of retry Count` })
        }
      } else {
        return Promise.reject({ code: err.code, message: err.message })
      }
    }
  }


  private async storefront(shop: string, params: GraphqlParams, retryCount: number = 0) {
    let shopCache = this.ShopCacheMapList[shop];
    if (!shopCache) {
      return Promise.reject({ code: 500, message: "Store not authorized" });
    }

    if (!shopCache.storefront_token) {
      return Promise.reject({ code: 500, message: "Authorization not storefront_access_token configured" });
    }

    if (!shopCache.storefront_access_token) {
      const rest = new Shopify.Clients.Rest(
        shop, shopCache.storefront_token
      )

      let storefrontTokenResponse = await rest.post({
        path: 'storefront_access_tokens',
        type: DataType.JSON,
        data: {
          storefront_access_token: {
            title: 'my access token',
          },
        },
      });

      if (storefrontTokenResponse && storefrontTokenResponse.body['storefront_access_token'] && storefrontTokenResponse.body['storefront_access_token']['access_token']) {
        this.ShopCacheMapList[shop].storefront_access_token = storefrontTokenResponse.body['storefront_access_token']['access_token'];
        shopCache = this.ShopCacheMapList[shop];
        await this.Database.manager.update(ShopifyShopAuthEntity, { shop: shop, is_storefront: true }, { access_token: this.ShopCacheMapList[shop].storefront_access_token });
      }
    }

    const client = new Shopify.Clients.Storefront(
      shop, shopCache.storefront_access_token
    );

    try {
      const response: RequestReturn = await client.query(params);
      const body: any = response.body;
      // this.Logger.debug(`restDelete ${shop} limit ${response.headers.get('x-shopify-shop-api-call-limit')}`);
      // if (body.extensions && body.extensions.cost && body.extensions.cost.throttleStatus) {
      //   this.Logger.debug(`graphql ${shop} Cost:${body.extensions.cost.requestedQueryCost}/${body.extensions.cost.actualQueryCost} limit:${body.extensions.cost.throttleStatus.currentlyAvailable}/${body.extensions.cost.throttleStatus.maximumAvailable} restoreRate:${body.extensions.cost.throttleStatus.restoreRate}`);
      // }
      return response.body ? response.body["data"] : response.body;
    } catch (err) {
      retryCount++;
      if (await this.errorProcess(shop, err, retryCount)) {
        if (retryCount <= this.SHOPIFY_RETRY) {
          this.Logger.warn(`graphql ${shop} data【${params.data}】retry ${retryCount}/${this.SHOPIFY_RETRY}`)
          return await this.storefront(shop, params, retryCount);
        } else {
          return Promise.reject({ code: 429, message: `Maximum ${this.SHOPIFY_RETRY} of of retry Count` })
        }
      } else {
        return Promise.reject({ code: err.code, message: err.message })
      }
    }
  }


  async errorProcess(shop, err, retryCount) {
    if (err && err.response) {
      switch (err.response.code) {
        case 401:
          //未鉴权报错
          delete this.ShopCacheMapList[shop];
          break;
        case 404:
          //接口不存在报错
          break;
        case 429:
          //请求过多报错处理
          await utilsDelay((5 - (retryCount < 4 ? retryCount : 3)) * 1000);
          // await utilsDelay(1000);
          return true;
        case 2001:
          //this.logger.log("数据库相关报错");
          break;
        default:
          await utilsDelay((5 - (retryCount < 4 ? retryCount : 3)) * 1000);
          this.Logger.error(`errorProcess default code [${JSON.stringify(err)}]`, { code: err.response.code, statusText: err.response.statusText, body: err.response.body });
          return true;
      }
    } else {
      this.Logger.error(`errorProcess manager [${JSON.stringify(err)}]`);
      return true;
    }
    return false;
  }
}