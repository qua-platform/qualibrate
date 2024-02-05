export type Res<P = Record<string, never>> = {
  isOk: boolean;
  error?: string | { detail: string };
  result?: P;
};

export type PRes<P = Record<string, never>> = Promise<Res<P>>;
