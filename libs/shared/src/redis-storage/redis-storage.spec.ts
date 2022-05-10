import { RedisStorage } from './redis-storage';

describe('RedisStorage', () => {

  const redis = new RedisStorage();
  const key = "testKey", keyVal = "testVal";

  it('ping ok', async () => {
    const pong = await redis.ping()
    expect(pong).toEqual("PONG");
  });

  it('set ok', async () => {
    const isOk = await redis.set(key, keyVal)
    expect(isOk).toEqual("OK");
  });

  it('get ok', async () => {
    const val = await redis.get(key)
    expect(val).toEqual(keyVal);
  });

  it('del ok', async () => {
    const delCount = await redis.del(key)
    expect(delCount).toEqual(1);
  });

});

