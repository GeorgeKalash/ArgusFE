import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { DocumentReleaseRepository } from '@argus/repositories/src/repositories/DocumentReleaseRepository'
import CharacteristicForm from './CharacteristicForm'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const CharacteristicsTab = ({ labels, maxAccess, store }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const columns = [
    {
      field: 'chName',
      headerName: labels.characteristics,
      flex: 1
    },
    {
      field: 'value',
      headerName: labels.value,
      flex: 1
    },
    {
      field: 'oper',
      headerName: labels.operator,
      flex: 1
    }
  ]

  const {
    query: { data },
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    enabled: !!recordId,
    endpointId: DocumentReleaseRepository.ClassCharacteristics.qry,
    datasetId: ResourceIds.Classes
  })

  async function fetchGridData() {
    if (!recordId) return { list: [] }

    return await getRequest({
      extension: DocumentReleaseRepository.ClassCharacteristics.qry,
      parameters: `_classId=${recordId}`
    })
  }

  const del = async obj => {
    await postRequest({
      extension: DocumentReleaseRepository.ClassCharacteristics.del,
      record: JSON.stringify(obj)
    })
    toast.success(platformLabels.Deleted)
    invalidate()
  }

  const add = () => openForm()

  function openForm() {
    stack({
      Component: CharacteristicForm,
      props: {
        labels,
        classId: recordId,
        maxAccess,
        invalidate
      },
      width: 400,
      height: 400,
      title: labels.characteristics
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          name='characteristics'
          columns={columns}
          gridData={data}
          rowId={['chId']}
          onDelete={del}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default CharacteristicsTab