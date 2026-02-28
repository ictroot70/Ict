type MaybeUnwrap<T> = T & { unwrap?: () => Promise<unknown> }

export type ExtractRtkActions<Api> = Api extends {
  endpoints: infer Endpoints
  util: { invalidateTags: infer Invalidate }
}
  ? {
      [Key in keyof Endpoints]: Endpoints[Key] extends {
        initiate: (...args: infer Args) => infer Result
      }
        ? (...args: Args) => MaybeUnwrap<Result> //unwrap optional
        : never
    } & {
      invalidate: Invalidate
    }
  : never
