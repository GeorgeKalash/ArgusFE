import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useDocumentTypeProxy } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import DocumentTypeDefaultForm from './form/DocumentTypeDefaultForm'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { Router } from '@argus/shared-domain/src/lib/useRouter'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'

const SalesTrxDefaults = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { functionId } = Router()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: SaleRepository.DocumentTypeDefault.page,
      parameters: `_sortBy=reference&_functionId=${functionId}&_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    filterBy,
    refetch,
    labels,
    access,
    paginationParameters,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SaleRepository.DocumentTypeDefault.page,
    datasetId: ResourceIds.DocumentTypeDefault,
    filter: {
      filterFn: fetchWithFilter,
      default: { functionId }
    }
  })

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const columns = [
    {
      field: 'commitItems',
      headerName: labels.commitItems,
      flex: 1
    },
    {
      field: 'dtName',
      headerName: labels.documentType,
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
      Component: DocumentTypeDefaultForm,
      props: {
        labels,
        recordId: record?.dtId,
        maxAccess: access,
        functionId
      },
      width: 800,
      height: 600,
      title: labels.dtDefault
    })
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: functionId,
    action: openForm
  })

  const add = async () => {
    await proxyAction()
  }

  const del = async obj => {
    await postRequest({
      extension: SaleRepository.DocumentTypeDefault.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const reportName = functionId == SystemFunction.SalesReturn ? 'SADTD_2' : 'SADTD_1'
  
  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar hasSearch={false} onAdd={add} maxAccess={access} reportName={reportName} filterBy={filterBy} />
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
          paginationParameters={paginationParameters}
          refetch={refetch}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default SalesTrxDefaults
