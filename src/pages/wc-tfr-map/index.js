import MatrixGrid from 'src/components/Shared/MatrixTable'
import { useContext, useEffect } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { useWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'

export default function WorkCenterTransferMap() {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    labels
  } = useResourceQuery({
    queryFn: getAllWorkCenters,
    endpointId: ManufacturingRepository.WorkCenter.qry,
    datasetId: ResourceIds.WorkCenterTransferMap
  })
  async function getAllWorkCenters() {
    const res = await getRequest({
      extension: ManufacturingRepository.WorkCenter.qry,
      parameters: `_filter=`
    })

    return res.list
  }

  useEffect(() => {
    ;(async function () {})()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h2>Matrix Example</h2>
      <MatrixGrid rowsList={data} columnsList={data} savedIntersections={[]} />
    </div>
  )
}
