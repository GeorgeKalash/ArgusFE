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
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import DraftSerialsInvoiceForm from './Forms/DraftSerialsInvoice'
import { Router } from '@argus/shared-domain/src/lib/useRouter'

const DraftSerialsInvoice = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const { functionId } = Router()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: SaleRepository.DocumentTypeDefault.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_functionId=${functionId}`
    })

    return { ...response, _startAt: _startAt }
  }

  const getResourceId = functionId => {
    switch (functionId) {
      case SystemFunction.DraftSerialsIn:
        return ResourceIds.DraftSerialsInvoiceDTD
      case SystemFunction.DraftInvoiceReturn:
        return ResourceIds.DraftSerialsReturnDTD
      default:
        return
    }
  }

  const {
    query: { data },
    labels,
    access,
    invalidate,
    refetch,
    paginationParameters
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SaleRepository.DocumentTypeDefault.page,
    datasetId: ResourceIds.DraftSerialsInvoiceDTD,
    DatasetIdAccess: getResourceId(parseInt(functionId))
  })

  const getCorrectLabel = functionId => {
    if (functionId === SystemFunction.DraftSerialsIn) {
      return labels.saDraft
    } else if (functionId === SystemFunction.DraftInvoiceReturn) {
      return labels.saDraftReturn
    }
  }

  const columns = [
    {
      field: 'dtName',
      headerName: labels.documentType,
      flex: 1
    },
    {
      field: 'spName',
      headerName: labels.salesPerson,
      flex: 1
    },
    {
      field: 'plantName',
      headerName: labels.plant,
      flex: 1
    },
    {
      field: 'siteRef',
      headerName: labels.siteRef,
      flex: 1
    },
    {
      field: 'siteName',
      headerName: labels.site,
      flex: 1
    }
  ]

  const edit = obj => {
    openForm(obj)
  }

  function openForm(record) {
    stack({
      Component: DraftSerialsInvoiceForm,
      props: {
        labels: labels,
        recordId: record?.dtId,
        maxAccess: access,
        functionId
      },
      width: 500,
      height: 380,
      title: getCorrectLabel(parseInt(functionId))
    })
  }

  const add = async () => {
    openForm()
  }

  const del = async obj => {
    await postRequest({
      extension: SaleRepository.DocumentTypeDefault.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
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

export default DraftSerialsInvoice
