import { useEffect, useState } from 'react'
import ErrorWindow from '@argus/shared-ui/src/components/Shared/ErrorWindow'

export default function GlobalErrorHandlers() {
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

  return <ErrorWindow open={!!err} message={{ message: err }} onClose={() => setErr(null)} />
}
