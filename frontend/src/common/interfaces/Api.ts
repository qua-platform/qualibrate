export type Res<P = Record<string, never>> = {
  isOk: boolean;
  error?: string | { detail: string };
  result?: P;
};
