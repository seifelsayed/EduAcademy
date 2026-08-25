import { BrowserRouter } from 'react-router-dom'

import { AppBootstrap } from '@/app/providers/AppBootstrap'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { AppRoutes } from '@/app/router/AppRoutes'
import { ErrorBoundary } from '@/app/providers/ErrorBoundary'
import { ToastViewport } from '@/components/organisms/ToastViewport'

/**
 * Composition root. Order matters: the router has to be outside the bootstrap,
 * because session handling navigates; the error boundary wraps everything so a
 * render crash still shows something usable.
 */
export function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <BrowserRouter>
          <AppBootstrap>
            <AppRoutes />
            <ToastViewport />
          </AppBootstrap>
        </BrowserRouter>
      </QueryProvider>
    </ErrorBoundary>
  )
}
