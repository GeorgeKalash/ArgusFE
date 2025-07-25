import { useContext, useState } from 'react'
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
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import WorksheetWindow from './window/WorksheetWindow'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { SystemFunction } from 'src/resources/SystemFunction'

const MfWorksheet = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [params, setParams] = useState('')
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: ManufacturingRepository.Worksheet.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=&_params=${params}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    filterBy,
    refetch,
    labels: _labels,
    access,
    paginationParameters,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.Worksheet.page,
    datasetId: ResourceIds.Worksheet,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters, pagination = {} }) {
    const { _startAt = 0, _size = 50 } = pagination
    if (filters.qry) {
      const response = await getRequest({
        extension: ManufacturingRepository.Worksheet.snapshot,
        parameters: `_filter=${filters.qry}&_startAt=${_startAt}&_size=${_size}`
      })

      return { ...response, _startAt: _startAt }
    } else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'jobRef',
      headerName: _labels.jobOrder,
      flex: 1
    },
    {
      field: 'designRef',
      headerName: _labels.designRef,
      flex: 1
    },
    {
      field: 'wcName',
      headerName: _labels.workCenter,
      flex: 1
    },
    {
      field: 'laborName',
      headerName: _labels.labor,
      flex: 1
    },
    {
      field: 'pcs',
      headerName: _labels.pieces,
      flex: 1,
      type: 'number'
    },
    {
      field: 'qty',
      headerName: _labels.firstQty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'eopQty',
      headerName: _labels.endQty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'pgItemName',
      headerName: _labels.pgItem,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: _labels.status,
      flex: 1
    }
  ]

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.Worksheet,
    action: openForm
  })

  function openForm(obj) {
    stack({
      Component: WorksheetWindow,
      props: {
        recordId: obj?.recordId
      }
    })
  }

  const edit = obj => {
    openForm(obj)
  }

  const add = () => {
    proxyAction()
  }

  const del = async obj => {
    await postRequest({
      extension: ManufacturingRepository.Worksheet.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} filterBy={filterBy} reportName={'MFWST'} />
      </Fixed>
      <Grow>
        <Table
          name='table'
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

export default MfWorksheet
