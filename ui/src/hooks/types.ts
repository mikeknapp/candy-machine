export type Path<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends Array<infer U>
          ? `${K}` | `${K}[${number}]` | `${K}[${number}].${Path<U>}`
          : T[K] extends Map<infer KeyType, infer ValueType>
            ?
                | `${K}`
                | `${K}.${string & KeyType}`
                | `${K}.${string & KeyType}.${Path<ValueType>}`
            : `${K}` | `${K}.${Path<T[K]>}`
        : never;
    }[keyof T]
  : never;

export type ExtractProperty<T, P extends string> = P extends keyof T
  ? { [Key in P]: T[P] }
  : P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? { [Key in K]: ExtractProperty<T[K], Rest> }
      : P extends `${infer K}[${number}].${infer Rest}`
        ? K extends keyof T
          ? T[K] extends Array<infer U>
            ? { [Key in K]: Array<ExtractProperty<U, Rest>> }
            : string
          : boolean
        : never
    : never;

type Merge<T> = {
  [K in keyof T]: T[K] extends object ? MergeObject<T[K]> : T[K];
};

type MergeObject<T> = T extends any[]
  ? T
  : {
      [K in keyof T]: T[K] extends object ? MergeObject<T[K]> : T[K];
    };

export type ExtractProperties<T, P extends string[]> = P extends [
  infer Head,
  ...infer Tail,
]
  ? Head extends string
    ? Tail extends string[]
      ? Merge<ExtractProperty<T, Head> & ExtractProperties<T, Tail>>
      : never
    : never
  : {};

// TODO: Add tests.
export function getNestedValue<T>(obj: T, path: string): any {
  const keys = path.split(".") as (keyof T)[];
  let value: any = obj;
  for (const key of keys) {
    if (value && key in value && value[key] !== undefined) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  return value;
}

export function setNestedValue<T>(obj: any, path: string, value: any): void {
  const keys = path.split(".");
  let current = obj;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      current[key] = value;
    } else {
      current[key] = current[key] || {};
      current = current[key];
    }
  });
}
