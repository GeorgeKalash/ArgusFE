import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { PointofSaleRepository } from '@argus/repositories/src/repositories/PointofSaleRepository'
import RetailDocTypeForm from './form/RetailDocTypeForm'
import { Router } from '@argus/shared-domain/src/lib/useRouter'

const RetailDtd = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  const { functionId } = Router()

  async function fetchGridData(options = {}) {
    const {
      pagination: { _startAt = 0, _pageSize = 50 }
    } = options

    const response = await getRequest({
      extension: PointofSaleRepository.DocumentTypeDefault.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_functionId=${functionId}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    access,
    paginationParameters,
    invalidate,
    refetch
  } = useResourceQuery({
    endpointId: PointofSaleRepository.DocumentTypeDefault.qry,
    datasetId: ResourceIds.POSDocTypeDefault,

    filter: {
      filterFn: fetchGridData,
      default: { functionId }
    }
  })

  const columns = [
    {
      field: 'dtName',
      headerName: _labels.doctype,
      flex: 1
    },

    {
      field: 'disableSKULookup',
      headerName: _labels.dsl,
      type: 'checkbox',
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj)
  }

  const del = async obj => {
    await postRequest({
      extension: PointofSaleRepository.DocumentTypeDefault.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(record) {
    stack({
      Component: RetailDocTypeForm,
      props: {
        labels: _labels,
        functionId,
        recordId: record?.dtId,
        maxAccess: access
      },
      width: 500,
      height: 300,
      title: _labels.doctypeDefault
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['dtId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationParameters={paginationParameters}
          refetch={refetch}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default RetailDtd
