import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'

import { isApiError } from '@/core/domain/errors/ApiError'
import { env } from '@/shared/config/env'
import { toast } from '@/stores/toastStore'

/**
 * Query defaults are deliberately conservative:
 *  - client mistakes (4xx) are never retried, only transient faults are,
 *  - background refetch on window focus is off, because this app's data is
 *    read-heavy and refetching a course catalogue on every tab switch is noise.
 *
 * Failed *queries* surface a toast centrally; mutations handle their own so the
 * message can be specific to the action.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            // A background refetch that fails while cached data is on screen
            // should stay quiet — the user still sees something valid.
            if (query.state.data !== undefined) return

            if (isApiError(error) && (error.isUnauthenticated || error.isNotFound)) return

            toast.fromError(error, 'Could not load this content.')
          },
        }),

        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (isApiError(error) && !error.isRetryable) return false

              return failureCount < 2
            },
          },
          mutations: {
            retry: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={client}>
      {children}
      {env.isDev ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  )
}
