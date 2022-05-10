/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import { Express } from 'express';
import { DataSource } from 'typeorm';
import { Redis } from 'ioredis';
import * as cookieParser from "cookie-parser";
import Shopify, { DataType } from '@shopify/shopify-api';

import { ShopifyController, ShopifyClient } from '@ankershopifyapps/shopify';
import {
  RedisStorage, DatabaseStorage, Logger,
  TaskEntity,
  ShopifyShopEntity, ShopifyShopAuthEntity, ShopifyUserEntity, ShopifyUserShopEntity,
  utilsDelay, utilsRandom, 
  Task,
} from '@ankershopifyapps/shared';

export class bootstrap {
  public App: Express;
  public Redis: Redis;
  public Database: DataSource;
  public Logger: Logger;
  private Port: number | string;

  constructor() {
    this.App = express();
    this.Port = process.env.PORT || 8080;
    this.App.use((req, res, next) => {
      const dt = new Date()
      console.log('time', dt.toLocaleTimeString(), 'url', req.url)
      next();
    });
    this.App.use("/user",(req,res,next)=>{

      return res.status(200).json({"test":"test"});
    });
    const client = new ShopifyClient(this);
    this.initial()
  }

  private async initial() {
    this.Redis = new RedisStorage();
    this.Database = new DatabaseStorage([TaskEntity, ShopifyShopEntity, ShopifyShopAuthEntity, ShopifyUserEntity, ShopifyUserShopEntity]);
    this.Logger = new Logger();
    this.App.use((new ShopifyController(this)).Router);
    await this.Database.initialize();

    (new Task(this)).start();
    this.start();
  }

  private async start() {
    this.App.listen(this.Port, () => {
      this.Logger.info(`Listening at http://localhost:${this.Port}`);
    }).on('error', console.error);
  }
  
}


new bootstrap();
