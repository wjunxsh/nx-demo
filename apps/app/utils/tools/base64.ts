//  加密
export const Base64Encode = (str: string) => {
    return btoa(encodeURIComponent(str));
};
  
//  解密
export const Base64Decode = (str: string) => {
    return decodeURIComponent(atob(str));
};
