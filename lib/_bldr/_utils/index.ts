
/**
 * 
 * @param obj 
 * @returns 
 */
const assignObject = (obj: any) => Object.assign({}, obj);

/**
 * 
 * @param array 
 * @param key 
 * @returns 
 */
const uniqueArrayByKey = (array: any[], key: string) => [...new Map(array.map(item =>
  [item[key], item])).values()];

export { assignObject, 
  uniqueArrayByKey };
