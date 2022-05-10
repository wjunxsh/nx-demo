// 延迟
export const utilsDelay = (time: any) => new Promise((resolve: any) => setTimeout(() => resolve(), time));


// 数组去重
export const utilsUnique = (arr: Array<any>) => Array.from(new Set(arr));

// 生成随机数
export const utilsRandom = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);
