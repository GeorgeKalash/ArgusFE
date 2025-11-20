import React, { useEffect, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { emitError } from '@argus/shared-domain/src/lib/error'
import ErrorWindow from './ErrorWindow'

function AppFallback({ error }) {
  const [err, setErr] = useState(error?.message)

  useEffect(() => {
    emitError(error)
  }, [error])

  return <ErrorWindow open={!!err} message={{ message: err }} onClose={() => setErr(null)} />
}

export default function RootBoundary({ children, resetKey }) {
  return (
    <ErrorBoundary FallbackComponent={AppFallback} resetKeys={[resetKey]}>
      {children}
    </ErrorBoundary>
  )
}
