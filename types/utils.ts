export type MakeTypeNever<T> = {
  [k in keyof T]?: never;
};
