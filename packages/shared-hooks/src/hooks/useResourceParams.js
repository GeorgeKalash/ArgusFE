import { useContext, useEffect, useState } from 'react'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

export default function useResourceParams({ datasetId, DatasetIdAccess, editMode, cacheOnlyMode }) {
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  const { getLabels, getAccess } = useContext(ControlContext)

  useEffect(() => {
    const resourceId = DatasetIdAccess || datasetId
    if (resourceId) {
      if (!access) getAccess(resourceId, setAccess, cacheOnlyMode)
      else {
        if (access.record.maxAccess > 0) {
          getLabels(datasetId, setLabels, cacheOnlyMode)
        }
      }
    }
  }, [access])

  const _labels = labels ? Object.fromEntries(labels?.map(({ key, value }) => [key, value])) : {}

  return {
    labels: _labels,
    access: editMode ? { ...access, editMode } : access
  }
}
