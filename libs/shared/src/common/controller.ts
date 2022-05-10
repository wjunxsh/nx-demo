import { Redis } from 'ioredis';
import { DataSource } from 'typeorm';
import * as express from 'express';
import { Express, Router, RequestHandler, Response, Request } from 'express';
import { Logger } from '../logger';

export interface ControllerBaseInterface { App: Express, Redis: Redis, Database: DataSource, Logger: Logger, verifyRequest?(app: Express, opt?: object): RequestHandler }

export class ControllerBase {
  public App: Express;
  public Redis: Redis;
  public Database: DataSource;
  public Router: Router;
  public Logger: Logger;
  constructor(bootstrap: ControllerBaseInterface) {
    this.App = bootstrap.App;
    this.Redis = bootstrap.Redis;
    this.Database = bootstrap.Database;
    this.Logger = bootstrap.Logger;
    if (bootstrap.verifyRequest) {
      this.verifyRequest = bootstrap.verifyRequest;
    }
    this.Router = express.Router();
  }
  public verifyRequest(app: Express, opt?: object): RequestHandler {
    return async (req: Request, res: Response, next?: any) => { console.log(""); };
  };
}