import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import ProdSheetDtdForm from './form/ProdSheetDtdForm'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'

const ProdSheetDtd = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: ManufacturingRepository.DocumentTypeDefault.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_functionId=${SystemFunction.ProductionSheet}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    invalidate,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.DocumentTypeDefault.page,
    datasetId: ResourceIds.ProdSheetDocumentTypeDefault
  })

  const columns = [
    {
      field: 'dtName',
      headerName: labels.docType,
      flex: 1
    },
    {
      field: 'siteName',
      headerName: labels.site,
      flex: 1
    },
    {
      field: 'disableSKULookup',
      headerName: labels.dsl,
      type: 'checkbox',
      flex: 1
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
      Component: ProdSheetDtdForm,
      props: {
        labels,
        recordId: record?.dtId,
        maxAccess: access
      },
      width: 600,
      height: 400,
      title: labels.docTypeDefault
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
          columns={columns}
          gridData={data}
          rowId={['dtId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default ProdSheetDtd
