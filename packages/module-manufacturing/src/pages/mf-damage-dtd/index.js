import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useContext } from 'react'
import toast from 'react-hot-toast'
import DamageDocDefaultTypeForm from './Forms/DamageDocDefaultTypeForm'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { useWindow } from '@argus/shared-providers/src/providers/windows'

const DamageDtd = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: ManufacturingRepository.DocumentTypeDefault.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=&_functionId=${SystemFunction.Damage}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    invalidate,
    refetch,
    access,
    paginationParameters
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.DocumentTypeDefault.page,
    datasetId: ResourceIds.MFDamageDtd
  })

  const columns = [
    {
      field: 'dtName',
      headerName: labels.docType,
      flex: 1
    },

    {
      field: 'genJobFromDamage',
      headerName: labels.genJobFromDamage,
      flex: 1,
      type: 'checkbox'
    }
  ]

  const add = () => {
    openForm()
  }

  const del = async obj => {
    await postRequest({
      extension: ManufacturingRepository.DocumentTypeDefault.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(record) {
    stack({
      Component: DamageDocDefaultTypeForm,
      props: {
        labels,
        recordId: record?.dtId,
        maxAccess: access
      },
      width: 600,
      height: 250,
      title: labels.damageDTD
    })
  }

  const edit = obj => {
    openForm(obj)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['dtId']}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          refetch={refetch}
          paginationType='api'
          paginationParameters={paginationParameters}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default DamageDtd
