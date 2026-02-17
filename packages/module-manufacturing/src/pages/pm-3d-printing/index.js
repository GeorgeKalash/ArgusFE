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
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ProductModelingRepository } from '@argus/repositories/src/repositories/ProductModelingRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useDocumentTypeProxy } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import ThreeDPrintForm from '@argus/shared-ui/src/components/Shared/Forms/ThreeDPrintForm'

const ThreeDPrinting = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: ProductModelingRepository.Printing.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    access,
    invalidate,
    filterBy
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ProductModelingRepository.Printing.page,
    datasetId: ResourceIds.Printing,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: ProductModelingRepository.Printing.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'startDate',
      headerName: labels.startDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'endDate',
      headerName: labels.endDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'threeDDRef',
      headerName: labels.threeDD,
      flex: 1,
      valueLink: {
        resourceId: ResourceIds.ThreeDDesign,
        props: row => ({
          recordId: row.threeDDId,
        })
      }
    },
    {
      field: 'fileReference',
      headerName: labels.threeDFile,
      flex: 1
    },
    {
      field: 'machineName',
      headerName: labels.machine,
      flex: 1
    },
    {
      field: 'setPcs',
      headerName: labels.threeDPrintPcs,
      flex: 1,
      type: 'number'
    },
    {
      field: 'weight',
      headerName: labels.threeDPrintWGT,
      flex: 1,
      type: 'number'
    },
    {
      field: 'productionLineName',
      headerName: labels.productionLineName,
      flex: 1
    },
    {
      field: 'itemGroupName',
      headerName: labels.itemGroup,
      flex: 1
    },
    {
      field: 'collectionName',
      headerName: labels.collection,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    }
  ]

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.ThreeDPrint,
    action: openForm
  })

  const add = async () => {
    await proxyAction()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: ThreeDPrintForm,
      props: {
        recordId
      }
    })
  }

  const del = async obj => {
    await postRequest({
      extension: ProductModelingRepository.Printing.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar labels={labels} maxAccess={access} filterBy={filterBy} onAdd={add} reportName={'PM3DP'} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          deleteConfirmationType={'strict'}
          isLoading={false}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default ThreeDPrinting
