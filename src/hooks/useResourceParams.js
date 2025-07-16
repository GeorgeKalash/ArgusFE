import { useContext, useEffect, useState } from 'react'
import { ControlContext } from 'src/providers/ControlContext'

export default function useResourceParams({ datasetId, DatasetIdAccess, editMode, disabled }) {
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  const { getLabels, getAccess } = useContext(ControlContext)

  useEffect(() => {
    const resourceId = DatasetIdAccess || datasetId
    if (resourceId) {
      if (!access) getAccess(resourceId, setAccess, disabled)
      else {
        if (access.record.maxAccess > 0) {
          getLabels(datasetId, setLabels, disabled)
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
