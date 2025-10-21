import { useEffect, useState } from 'react'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { ErrorBoundary } from 'react-error-boundary'

function Fallback({ error, resetErrorBoundary }) {
  const [err, setErr] = useState(error.message)

  return <ErrorWindow open={err} message={{ message: error.message }} onClose={() => setErr(null)} />
}

export default function GlobalErrorHandlers({ children }) {
  const [err, setErr] = useState(null)

  useEffect(() => {
    const onError = e => setErr(e?.message || 'Unexpected error')
    const onUnhandled = e => setErr((e?.reason?.message ?? String(e?.reason)) || 'Request failed')

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onUnhandled)

    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onUnhandled)
    }
  }, [])

  return (
    <>
      {children}
      <ErrorWindow open={!!err} message={{ message: err }} onClose={() => setErr(null)} />
    </>
  )
}
