export const isPlainObject = (obj: any): boolean => {
  return (
    typeof obj === "object" && // separate from primitives
    obj !== null && // is obvious
    obj.constructor === Object && // separate instances (Array, DOM, ...)
    Object.prototype.toString.call(obj) === "[object Object]"
  ); // separate build-in like Math
};
