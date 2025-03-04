import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { ProductModelingRepository } from 'src/repositories/ProductModelingRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import ThreeDPrintForm from './Forms/ThreeDPrintForm'

const ThreeDPrinting = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: ProductModelingRepository.Printing.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${
        params || ''
      }`
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
    filterBy,
    clearFilter,
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ProductModelingRepository.Printing.page,
    datasetId: ResourceIds.ThreeDPrint,
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
      field: 'machineName',
      headerName: labels.machine,
      flex: 1
    },
    {
      field: 'machineRef',
      headerName: labels.machineRef,
      flex: 1
    },
    {
      field: 'threeDDRef',
      headerName: labels.threeDD,
      flex: 1
    },
    {
      field: 'fileReference',
      headerName: labels.fileReference,
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
        labels,
        recordId,
        maxAccess: access
      },
      width: 700,
      height: 750,
      title: labels.ThreeDPrint
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

  const onApply = ({ search, rpbParams }) => {
    if (!search && rpbParams.length === 0) {
      clearFilter('params')
    } else if (!search) {
      filterBy('params', rpbParams)
    } else {
      filterBy('qry', search)
    }
    refetch()
  }

  const onSearch = value => {
    filterBy('qry', value)
  }

  const onClear = () => {
    clearFilter('qry')
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          onSearch={onSearch}
          onClear={onClear}
          labels={labels}
          maxAccess={access}
          onApply={onApply}
          onAdd={add}
          reportName={'PM3DP'}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
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