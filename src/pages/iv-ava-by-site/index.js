import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import { useResourceQuery } from 'src/hooks/resource'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import SerialForm from './forms/SerialForm'

const AvailabilitiesBySite = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: `RG.IV.asmx/IV403_p`,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}&exId=`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    access,

    filterBy
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: `RG.IV.asmx/IV403_p`,
    datasetId: ResourceIds.AvailabilitiesBySite,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'sku',
      headerName: _labels.sku,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'siteRef',
      headerName: _labels.siteRef,
      flex: 1
    },
    {
      field: 'siteName',
      headerName: _labels.siteName,
      flex: 1
    },
    {
      field: 'unitCost',
      headerName: _labels.unitCost,
      flex: 1
    },
    {
      field: 'unitPrice',
      headerName: _labels.unitPrice,
      flex: 1
    },
    {
      field: 'qty',
      headerName: _labels.qty,
      flex: 1
    },
    {
      field: 'pieces',
      headerName: _labels.pieces,
      flex: 1
    },
    {
      field: 'committed',
      headerName: _labels.committed,
      flex: 1
    },
    {
      field: 'netWeight',
      headerName: _labels.netWeight,
      flex: 1
    },
    {
      field: 'netVolume',
      headerName: _labels.netVolume,
      flex: 1
    },
    {
      field: 'netCost',
      headerName: _labels.netCost,
      flex: 1
    },
    {
      field: 'netPrice',
      headerName: _labels.netPrice,
      flex: 1
    }
  ]

  const onSerial = obj => {
    openSerialForm(obj.itemId, obj.siteId)
    console.log(obj, 'objjjjjjjjjjjjj')
  }

  const onLot = obj => {
    console.log(obj)
  }

  // function openLotForm(itemId) {
  //   stack({
  //     Component: ExRatesForm,
  //     props: {
  //       labels: _labels,
  //       record: record,
  //       maxAccess: access,
  //       recordId: record ? String(record.exId) + String(record.dayId) + String(record.seqNo) : null
  //     },
  //     width: 500,
  //     height: 400,
  //     title: _labels.exRate
  //   })
  // }

  function openSerialForm(itemId, siteId) {
    stack({
      Component: SerialForm,
      props: {
        labels: _labels,
        itemId: itemId,
        siteId: siteId,
        maxAccess: access
      },
      width: 600,
      height: 400,
      title: _labels.netVolume
    })
  }

  const onApply = ({ rpbParams }) => {
    filterBy('params', rpbParams)
    refetch()
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar hasSearch={false} maxAccess={access} onApply={onApply} reportName={'IV403'} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['itemId']}
          serialLotTable={true}
          onLot={onLot}
          onSerial={onSerial}
          maxAccess={access}
          refetch={refetch}
          pageSize={50}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default AvailabilitiesBySite
