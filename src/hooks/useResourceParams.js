import { useContext, useEffect, useState } from 'react'
import { ControlContext } from 'src/providers/ControlContext'

export default function useResourceParams({ datasetId, DatasetIdAccess, cache }) {
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  const { getLabels, getAccess, setContextLabels, contextData } = useContext(ControlContext)

  const resourceId = DatasetIdAccess || datasetId

  useEffect(() => {
    if (resourceId) {
      if (!access) getAccess(resourceId, setAccess)
      else {
        console.log('contextData', contextData)
        if (access.record.maxAccess > 0 && !contextData[resourceId]) {
          getLabels(
            datasetId,
            cache && !contextData[resourceId] ? fetchedLabels => setContextLabels(resourceId, fetchedLabels) : setLabels
          )
        }
      }
    }
  }, [access])

  const result = contextData[resourceId] || labels

  console.log(result)

  const _labels = result ? Object.fromEntries(result?.map(({ key, value }) => [key, value])) : {}

  return {
    labels: _labels,
    access
  }
}
