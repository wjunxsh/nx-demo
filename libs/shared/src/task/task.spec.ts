import * as schedule from 'node-schedule';

import Shopify, { DataType } from '@shopify/shopify-api';

import {
  RedisStorage, DatabaseStorage, Logger, ControllerBase, ControllerBaseInterface,
  TaskEntity, ShopifyShopEntity, ShopifyShopAuthEntity, ShopifyUserEntity, ShopifyUserShopEntity,
  utilsDelay, utilsRandom,
} from '@ankershopifyapps/shared';


import { Task } from './index';


export class TestTask extends ControllerBase {

  public TestTaskVal = 0;

  constructor(bootstrap: ControllerBaseInterface) {
    super(bootstrap);
    this.initial();
  }

  private async initial() {
    this.TestTaskVal = 0;
  }

  public register() {
    return this.registerExec.bind(this);
  }

  private async registerExec() {
    this.TestTaskVal++;
  }

  public run() {
    return this.runExec.bind(this);
  }

  private async runExec() {
    await utilsDelay(1000);
    console.log("TestTaskVal runExec: > ", this.TestTaskVal);
    // throw Error("异常");
  }

}


describe('shared.task', () => {

  const database = new DatabaseStorage([TaskEntity, ShopifyShopEntity, ShopifyShopAuthEntity, ShopifyUserEntity, ShopifyUserShopEntity]);
  const redis = new RedisStorage();
  const logger = new Logger();

  const controller = new ControllerBase({ App: null, Database: database, Redis: redis, Logger: logger } as ControllerBaseInterface);


  it('task', async () => {

    await database.initialize();

    const task = new Task(controller)
    const testTask = new TestTask(controller);

    await task.register("test.register", '*/5 * * * * *', true, testTask.register(), "测试模拟两个定时任务共享一个Class生命周期，执行注册");
    await task.register("test.run", '*/10 * * * * *', true, testTask.run(), "测试模拟两个定时任务共享一个Class生命周期,执行打印");
    task.start();

    await utilsDelay(10000)
    console.log( "testTask.TestTaskVal:>>", testTask.TestTaskVal );
    
    expect(testTask.TestTaskVal).toEqual(2);

  }, 50000)



  it('should work', () => {

    // 每秒执行一次
    schedule.scheduleJob('0-59 0-59 0-23 1-31 1-12 *', () => {
    })

    // 每分钟的第一秒执行一次
    schedule.scheduleJob('1 0-59 0-23 1-31 1-12 *', () => {
    })

    // 每十秒执行一次
    schedule.scheduleJob('*/5 0-59 0-23 1-31 1-12 *', () => {
    })

    // 每小时的第一分钟的第一秒执行一次
    schedule.scheduleJob('1 1 0-23 1-31 1-12 *', () => {
    })

    // 每5分钟的第一秒执行一次
    schedule.scheduleJob('1 */5 0-23 1-31 1-12 *', () => {
    })

    // 每天的1点的第一分钟的第一秒执行一次
    schedule.scheduleJob('1 1 1 1-31 1-12 *', () => {
    })

    // 每隔2小时执行一次
    schedule.scheduleJob('1 1 */2 1-31 1-12 *', () => {
    })

    // 每月的1号的1点的第一分钟的第一秒执行一次
    schedule.scheduleJob('1 1 1 1 1-12 *', () => {
    })

    expect("shopify").toEqual('shopify');
  });




});


