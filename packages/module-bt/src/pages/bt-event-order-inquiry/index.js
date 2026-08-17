import { useContext, useEffect } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { BrokerageTradingRepository } from '@argus/repositories/src/repositories/BrokerageTradingRepository'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import EventOrderForm from '@argus/shared-ui/src/components/Shared/Forms/EventOrderForm'
import GoldPriceTicker from '@argus/shared-ui/src/components/Shared/GoldPriceTicker'
import { useWindow } from '@argus/shared-providers/src/providers/windows'

const EventOrderInquiry = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: BrokerageTradingRepository.EventOrderInquiry.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
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
    endpointId: BrokerageTradingRepository.EventOrderInquiry.page,
    datasetId: ResourceIds.EventOrderInquiry,
    filter: {
      filterFn: fetchWithFilter
    }
  })


  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 300000) 

    return () => clearInterval(interval)
  }, [refetch])

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
      field: 'expiryDate',
      headerName: labels.expiryDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'accountRef',
      headerName: labels.accountRef,
      flex: 1
    },
    {
      field: 'accountName',
      headerName: labels.accountName,
      flex: 1
    },
    {
      field: 'directionName',
      headerName: labels.directionName,
      flex: 1
    },
    {
      field: 'metalRef',
      headerName: labels.metalRef,
      flex: 1
    },
    {
      field: 'currencyRef',
      headerName: labels.currencyRef,
      flex: 1
    },
    {
      field: 'qty',
      headerName: labels.qty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'qty_muRef',
      headerName: labels.qty_muRef,
      flex: 1,
      type: 'number'
    },
    {
      field: 'targetPrice',
      headerName: labels.targetPrice,
      flex: 1,
      type: 'number'
    },
    {
      field: 'amount',
      headerName: labels.amount,
      flex: 1,
      type: 'number'
    },
    {
      field: 'rsName',
      headerName: labels.rsName,
      flex: 1
    }
  ]

  const edit = obj => {
    stack({
      Component: EventOrderForm,
      props: {
        recordId : obj?.recordId
      }
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GoldPriceTicker currency='SAR' style={{ marginLeft: 16, marginBottom: 16 }} />
        <RPBGridToolbar hasSearch={false} labels={_labels} maxAccess={access} reportName={'BTEOI'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        
        
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          pageSize={50}
          onEdit={edit}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default EventOrderInquiry
