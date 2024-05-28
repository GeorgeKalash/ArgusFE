import { useEffect } from 'react'
import { useWindow } from 'src/windows'
import CARebuildAccountBalance from './form/CARebuildForm'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

const CaRebuildAba = () => {
  const { stack } = useWindow()

  const { labels } = useResourceQuery({
    datasetId: ResourceIds.CARebuildAccountBalance
  })

  useEffect(() => {
    openForm()
  }, [])

  function openForm() {
    stack({
      Component: CARebuildAccountBalance,

      expandable: false,

      closable: false,
      draggableWindow: false,
      width: 600,
      height: 400,
      title: labels.arb
    })
  }
}

export default CaRebuildAba
