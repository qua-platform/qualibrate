declare module "*.module.scss";

declare module "*.svg" {
  const content: any;
  export default content;
}

declare module "*.png" {
  const src: string;
  export default src;
}
