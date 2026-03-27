import { useCallback, useContext, useRef } from 'react'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import ConfirmationDialog from '@argus/shared-ui/src/components/ConfirmationDialog'

export const useValueLinkAccess = ({ cacheOnlyMode }) => {
  const { stack } = useWindow()
  const { getAccess, platformLabels } = useContext(ControlContext)

  const noAccessInflightRef = useRef(false)

  const fetchAccess = useCallback(
    resourceId =>
      new Promise(resolve => {
        let resolved = false
        let lastValue

        const done = value => {
          if (resolved) return
          resolved = true
          resolve(value)
        }

        const onAccess = value => {
          lastValue = value

          const flags = value?.record?.accessFlags
          const hasFlags = !!flags && typeof flags === 'object'
          const hasRecord = !!value?.record

          if (hasFlags || hasRecord) done(value)
        }

        const t = setTimeout(() => done(lastValue), 1500)

        const wrappedOnAccess = value => {
          onAccess(value)
          if (resolved) clearTimeout(t)
        }

        getAccess(resourceId, wrappedOnAccess, cacheOnlyMode)
      }),
    [getAccess, cacheOnlyMode]
  )

  const hasNoAccess = useCallback(access => {
    const flags = access?.record?.accessFlags

    if (!flags || typeof flags !== 'object') return true

    const entries = Object.entries(flags)
    if (entries.length === 0) return true

    const trueEntries = entries.filter(([, value]) => value === true)
    if (trueEntries.length === 0) return true

    const nonDeleteTrueEntries = trueEntries.filter(([key]) => {
      const normalizedKey = String(key).toLowerCase()
      return normalizedKey !== 'del'
    })

    return nonDeleteTrueEntries.length === 0
  }, [])

  const openNoAccessPopup = useCallback(() => {
    if (noAccessInflightRef.current) return
    noAccessInflightRef.current = true

    const closePopup = win => {
      noAccessInflightRef.current = false
      win?.close?.()
    }

    stack({
      Component: ConfirmationDialog,
      props: {
        DialogText: platformLabels.DontHaveAccess,
        okButtonAction: closePopup,
        fullScreen: false
      },
      refresh: false,
      width: 420,
      height: 160,
      title: platformLabels?.NoAccess
    })
  }, [stack, platformLabels])

  return { fetchAccess, hasNoAccess, openNoAccessPopup }
}