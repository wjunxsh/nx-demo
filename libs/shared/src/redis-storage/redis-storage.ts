import 'dotenv/config';
import * as IoRedis from 'ioredis';

export class RedisStorage extends IoRedis {
  constructor() {
    super(process.env.REDIS_SESSION_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      port:parseInt(process.env.REDIS_PORT || "6379"),
      host:process.env.REDIS_HOST || "127.0.0.1",
      password:process.env.REDIS_PASSWORD || "",
    })
  }
}