import MatrixGrid from 'src/components/Shared/MatrixTable'
import { useContext, useEffect, useState } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import WindowToolbar from 'src/components/Shared/WindowToolbar'

export default function WorkCenterTransferMap() {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [intersections, setIntersections] = useState([])
  const [data, setData] = useState([])

  const { access } = useResourceQuery({
    datasetId: ResourceIds.WorkCenterTransferMap
  })

  async function getAllWorkCenters() {
    const res = await getRequest({
      extension: ManufacturingRepository.WorkCenter.qry,
      parameters: `_filter=`
    })

    const mapping = res?.list?.map(item => {
      return {
        id: item.recordId,
        rowLabels: item.name,
        colLabels: item.reference
      }
    })
    setData(mapping || [])
  }

  async function getIntersections() {
    const res = await getRequest({
      extension: ManufacturingRepository.WorkCenterTransferMap.qry
    })

    const mapping = res?.list?.map(item => {
      return {
        rowId: item.fromWorkCenterId,
        colId: item.toWorkCenterId
      }
    })
    setIntersections(mapping || [])
  }

  async function handleSubmit() {
    await postRequest({
      extension: ManufacturingRepository.WorkCenterTransferMap.set2,
      record: JSON.stringify({
        items: intersections?.map(item => ({
          fromWorkCenterId: item.rowId,
          toWorkCenterId: item.colId
        }))
      })
    })

    toast.success(platformLabels.Updated)
  }

  useEffect(() => {
    getAllWorkCenters()
    getIntersections()
  }, [])

  return (
    <VertLayout>
      <Grow>
        <MatrixGrid
          rows={data}
          columns={data}
          intersections={intersections}
          setIntersections={setIntersections}
          maxAccess={access}
        />
      </Grow>
      <Fixed>
        <WindowToolbar isSaved onSave={handleSubmit} smallBox />
      </Fixed>
    </VertLayout>
  )
}
