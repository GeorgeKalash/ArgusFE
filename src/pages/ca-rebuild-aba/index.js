import { useEffect, useState } from 'react'
import { useWindow } from 'src/windows'
import CARebuildAccountBalance from './form/CARebuildForm'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

const CaRebuildAba = () => {
  const { stack } = useWindow()

  const { labels: _labels, access } = useResourceQuery({
    datasetId: ResourceIds.CARebuildAccountBalance
  })
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    if (_labels.accountRebuild && !rendered) {
      openForm()
      setRendered(true)
    }
  }, [_labels, rendered])

  function openForm() {
    stack({
      Component: CARebuildAccountBalance,
      props: {
        access,
        _labels
      },

      canExpand: false,

      closable: false,
      draggableWindow: false,
      width: 600,
      height: 400,
      title: _labels.accountRebuild
    })
  }

  return null
}

export default CaRebuildAba
