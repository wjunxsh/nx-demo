import localForage from "localforage";
import { Base64Decode, Base64Encode } from "./base64";

// if (typeof window != "undefined") {
//   localForage.config({
//     driver      : localForage.WEBSQL, // Force WebSQL; same as using setDriver()
//     name        : 'm',
//     version     : 1.0,
//     size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
//     storeName   : 'keyvaluepairs', // Should be alphanumeric, with underscores.
//     description : ''
//   });
// }

// 从仓库中获取 key 对应的值并将结果提供给回调函数。如果 key 不存在，getItem() 将返回 null。
export const getItem = async (key: string) => {
  let res: any = await localForage.getItem(key);
  if (res) {
    try {
      res = JSON.parse(Base64Decode(res));
    } catch (e) {
      res = {};
    }
  }
  return res;
};

//  将数据保存到离线仓库。你可以存储如下类型的 JavaScript 对象：
export const setItem = async (key: string, value: any) => {
  return await localForage.setItem(key, Base64Encode(JSON.stringify(value)));
};

//  从离线仓库中删除 key 对应的值。
export const removeItem = async (key: string) => {
  return await localForage.removeItem(key);
};

//  从数据库中删除所有的 key，重置数据库。
export const clear = async () => {
  return await localForage.clear();
};

//  获取数据仓库中所有的 key。
export const keys = async () => {
  return await localForage.keys();
};

//  获取离线仓库中的 key 的数量（即数据仓库的“长度”）。
export const length = async () => {
  return await localForage.length();
};

export default { getItem, setItem, removeItem, clear, keys, length };
