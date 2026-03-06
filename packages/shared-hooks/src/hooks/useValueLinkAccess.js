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
    const flagValues = flags && typeof flags === 'object' ? Object.values(flags) : null

    return !flagValues || flagValues.length === 0 || flagValues.every(v => v === false)
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