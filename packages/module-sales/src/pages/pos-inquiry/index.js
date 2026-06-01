import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import POSInquiryForm from './Forms/POSInquiryForm'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { PointofSaleRepository } from '@argus/repositories/src/repositories/PointofSaleRepository'

const POSInquiry = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options
    if(params){
      const response = await getRequest({
        extension: PointofSaleRepository.POSInquiry.page303,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
      })

      return { ...response, _startAt: _startAt }
    }
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    filterBy,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: PointofSaleRepository.POSInquiry.page303,
    datasetId: ResourceIds.POSInquiry,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
        field: 'businessDayId',
        headerName: labels.businessDayId,
        flex: 1
      },
      {
        field: 'documentRef',
        headerName: labels.documentRef,
        flex: 1
      },
      {
        field: 'posMachineRef',
        headerName: labels.posMachineRef,
        flex: 1
      },
      {
        field: 'customerRef',
        headerName: labels.customerRef,
        flex: 1,
      },
      {
        field: 'createdDate',
        headerName: labels.createdDate,
        flex: 1,
        type: 'date'
      },
      {
        field: 'amount',
        headerName: labels.amount,
        flex: 1,
        type: 'number'
      }
  ]

  const edit = obj => {
    openForm(obj)
  }

  function openForm(record) {
    stack({
      Component: POSInquiryForm,
      props: {
        labels,
        access,
        documentTypeId: record.documentTypeId,
        documentRef: record.documentRef
      },
      width: 1100,
      height: 700,
      title: labels.POSInquiry
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar hasSearch={false} maxAccess={access} filterBy={filterBy} paramsRequired={true} reportName={'PS303'} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          pageSize={50}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
          refetch={refetch}
        />
      </Grow>
    </VertLayout>
  )
}

export default POSInquiry
