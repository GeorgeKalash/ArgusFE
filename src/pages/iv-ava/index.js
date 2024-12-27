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
import { ReportIvGenerator } from 'src/repositories/ReportIvGeneratorRepository'
import AvailabilityList from './form/AvailabilityList'

const AvailabilitiesBySite = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: ReportIvGenerator.Report408,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}&exId=`
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
    refetch,
    access,
    filterBy
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ReportIvGenerator.Report408,
    datasetId: ResourceIds.AvailabilitiesGrid,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'unitCost',
      headerName: labels.unitCost,
      flex: 1,
      type: 'number'
    },
    {
      field: 'unitPrice',
      headerName: labels.unitPrice,
      flex: 1,
      type: 'number'
    },

    {
      field: 'qty',
      headerName: labels.qty,
      flex: 1,
      type: 'number'
    },
    ,
    {
      field: 'netWeight',
      headerName: labels.netWeight,
      flex: 1,
      type: 'number'
    },
    {
      field: 'netVolume',
      headerName: labels.netVolume,
      flex: 1,
      type: 'number'
    },
    {
      field: 'netCost',
      headerName: labels.netCost,
      flex: 1,
      type: 'number'
    },
    {
      field: 'netPrice',
      headerName: labels.netPrice,
      flex: 1,
      type: 'number'
    }
  ]

  const edit = obj => {
    openAvailability(obj)
  }

  function openAvailability(obj) {
    stack({
      Component: AvailabilityList,
      props: {
        labels,
        obj,
        maxAccess: access
      },
      width: 800,
      height: 550,
      title: labels.skuAva
    })
  }

  const onApply = ({ rpbParams }) => {
    filterBy('params', rpbParams)
    refetch()
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar hasSearch={false} maxAccess={access} onApply={onApply} reportName={'IV408'} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['itemId']}
          maxAccess={access}
          onEdit={edit}
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
