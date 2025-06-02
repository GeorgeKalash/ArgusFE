import { useContext, useEffect, useState } from 'react'
import { ControlContext } from 'src/providers/ControlContext'

export default function useResourceParams({ datasetId, DatasetIdAccess, window, titleKey }) {
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  const { getLabels, getAccess } = useContext(ControlContext)

  useEffect(() => {
    const resourceId = DatasetIdAccess || datasetId
    if (resourceId) {
      if (!access) getAccess(resourceId, setAccess)
      else {
        if (access.record.maxAccess > 0) {
          getLabels(datasetId, setLabels)
        }
      }
    }
  }, [access])

  const _labels = labels ? Object.fromEntries(labels?.map(({ key, value }) => [key, value])) : {}
  const title = _labels?.[titleKey]

  useEffect(() => {
    if (title) {
      window.setTitle(title)
    }
  }, [title])

  return {
    labels: _labels,
    access
  }
}
