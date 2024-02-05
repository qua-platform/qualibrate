export default function isEmpty(obj: any): boolean {
  if (obj && obj.constructor === Object) {
    return Object.entries(obj).length === 0;
  }
  if (typeof obj === "string" || obj instanceof String) {
    return obj === "" || !Boolean(obj);
  }
  return !Boolean(obj);
}
