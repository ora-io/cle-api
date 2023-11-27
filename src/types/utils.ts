export type Nullable<T> = T | null | undefined
export type NullableObject<T extends Object> = {
  [P in keyof T]: Nullable<T[P]>
}
export type NullableArray<T> = Array<Nullable<T>>
