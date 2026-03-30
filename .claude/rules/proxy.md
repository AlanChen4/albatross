# Proxy

Next.js uses `src/proxy.ts` for request interception (session refresh). Do not create a `middleware.ts` file — it is the deprecated predecessor to `proxy.ts`. The proxy only refreshes existing sessions — it does not create anonymous accounts. Anonymous sign-in is handled lazily on the client via `useEnsureSession()`, triggered only when the user first interacts (e.g. submits a question).
