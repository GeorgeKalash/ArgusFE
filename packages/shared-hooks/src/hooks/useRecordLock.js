import { useContext, useEffect, useRef } from 'react'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { LockedScreensContext } from '@argus/shared-providers/src/providers/LockedScreensContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import NormalDialog from '@argus/shared-ui/src/components/Shared/NormalDialog'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'

export const useRecordLock = ({
  recordId,
  reference,
  resourceId,
  enabled = false
} = {}) => {
  const { stack } = useWindow()

  const { addLockedScreen, removeLockedScreen } = useContext(LockedScreensContext)
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const lockCreatedRef = useRef(false)
  const releaseRequestedRef = useRef(false)

  const userId = JSON.parse(
    window.sessionStorage.getItem('userData')
  )?.userId

  const checkLock = async ({ resourceId, recordId }) => {
    if (!recordId || !resourceId) return true

    const res = await getRequest({
      extension: AccessControlRepository.LockedRecords.get,
      parameters: `_resourceId=${resourceId}&_recordId=${recordId}`
    })

    if (res.record && res.record.userId !== userId) {
      stack({
        Component: NormalDialog,
        props: {
          DialogText: `${platformLabels.RecordLocked} ${res.record.userName}`,
          title: platformLabels.Dialog
        }
      })

      return false
    }

    return true
  }

  const unlock = async () => {
    if (!lockCreatedRef.current || !recordId) return

    lockCreatedRef.current = false

    await postRequest({
      extension: AccessControlRepository.unlockRecord,
      record: JSON.stringify({
        resourceId,
        recordId,
        reference,
        userId,
        clockStamp: new Date()
      })
    })

    removeLockedScreen({
      resourceId,
      recordId
    })
  }

  const releaseLock = async () => {
    releaseRequestedRef.current = true
    await unlock()
  }

  useEffect(() => {
    if (!enabled || !recordId || !reference) return

    let cancelled = false

    lockCreatedRef.current = false
    releaseRequestedRef.current = false

    async function lock() {
      await postRequest({
        extension: AccessControlRepository.lockRecord,
        record: JSON.stringify({
          resourceId,
          recordId,
          reference,
          userId,
          clockStamp: new Date()
        })
      })

      if (cancelled) return

      lockCreatedRef.current = true

      if (releaseRequestedRef.current) {
        await unlock()
        return
      }

      addLockedScreen({
        resourceId,
        recordId,
        reference
      })
    }

    lock()

    return () => {
      cancelled = true
      releaseLock()
    }
  }, [
    enabled,
    recordId,
    resourceId,
    reference
  ])

  return {
    checkLock,
    releaseLock
  }
}