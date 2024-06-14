import { useContext } from 'react'
import { Box } from '@mui/material'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import MaterialsAdjustmentForm from './Forms/MaterialsAdjustmentForm'

const MaterialsAdjustment = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: InventoryRepository.MaterialsAdjustment.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=&_size=50&_params=&_dgId=0&_sortBy=recordId&_trxType=1`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.MaterialsAdjustment.qry,
    datasetId: ResourceIds.MaterialsAdjustment
  })

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.MaterialsAdjustment.qry
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels[12],
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels[3],
      flex: 1,
      valueFormatter: params => {
        const dateString = params.value
        const timestamp = parseInt(dateString.match(/\d+/)[0], 10)

        if (!isNaN(timestamp)) {
          const formattedDate = new Date(timestamp).toLocaleDateString('en-GB')

          return formattedDate
        } else {
          return 'Invalid Date'
        }
      }
    },
    {
      field: 'siteRef',
      headerName: _labels[10],
      flex: 1
    },
    {
      field: 'siteName',
      headerName: _labels[11],
      flex: 1
    },
    {
      field: 'description',
      headerName: _labels[13],
      flex: 1
    },
    {
      field: 'statusName',
      headerName: _labels[14],
      flex: 1
    },
    {
      field: 'qty',
      headerName: _labels[15],
      flex: 1
    }
  ]

  const edit = obj => {
    openForm(obj.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: MaterialsAdjustmentForm,
      props: {
        recordId: recordId ? recordId : null,
        labels: _labels,
        maxAccess: access
      },
      width: 900,
      height: 600,
      title: _labels[1]
    })
  }

  const del = async obj => {
    await postRequest({
      extension: InventoryRepository.MaterialsAdjustment.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  return (
    <>
      <Box sx={{ mt: 10 }}>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          deleteConfirmationType={'strict'}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Box>
    </>
  )
}

export default MaterialsAdjustment
