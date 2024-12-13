import { useContext, useEffect, useState } from 'react'
import { ControlContext } from 'src/providers/ControlContext'

export default function useResourceParams({ datasetId, accessDatasetId }) {
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  const { getLabels, getAccess } = useContext(ControlContext)

  useEffect(() => {
    const resourceId = accessDatasetId || datasetId
    if (resourceId) {
      if (!access) getAccess(resourceId, setAccess)
      else {
        if (access.record.maxAccess > 0) {
          getLabels(datasetId, setLabels)
        }
      }
    }
  }, [access])

  const _labels = labels ? Object.fromEntries(labels.map(({ key, value }) => [key, value])) : {}

  return {
    labels: _labels,
    access
  }
}
