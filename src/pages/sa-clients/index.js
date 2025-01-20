import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import ClientsWindow from './Windows/ClientsWindow'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { ControlContext } from 'src/providers/ControlContext'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { Box, IconButton } from '@mui/material'
import PreviewForm from './forms/PreviewForm'

const SAClients = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    labels: labels,
    filterBy,
    clearFilter,
    paginationParameters,
    invalidate,
    access,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SaleRepository.Client.page,
    datasetId: ResourceIds.Client,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: SaleRepository.Client.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}&_sortField=recordId asc`
    var parameters = defaultParams

    const response = await getRequest({
      extension: SaleRepository.Client.page,
      parameters: parameters
    })

    return { ...response, _startAt: _startAt }
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'flName',
      headerName: labels.foreignLanguage,
      flex: 1
    },
    ,
    {
      field: 'cgName',
      headerName: labels.cGroup,
      flex: 1
    },
    {
      field: 'ptName',
      headerName: labels.paymentTerm,
      flex: 1
    },
    {
      field: 'currencyName',
      headerName: labels.currency,
      flex: 1
    },
    {
      field: 'plName',
      headerName: labels.priceLevel,
      flex: 1
    },
    {
      field: 'spName',
      headerName: labels.salesPerson,
      flex: 1
    },
    {
      field: 'szName',
      headerName: labels.saleZone,
      flex: 1
    },
    {
      field: 'acquisitionDate',
      headerName: labels.acquisitionDate,
      flex: 1,
      type: 'date'
    },
    {
      flex: 0.5,
      headerName: '',
      cellRenderer: row => {
        return (
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            <IconButton size='small' onClick={() => openPreview(row.data.recordId, row.data.addressId)}>
              <img src='/images/password/forgotPWD1.png' alt={'preview'} />
            </IconButton>
          </Box>
        )
      }
    }
  ]

  const openPreview = (clientId, addressId) => {
    stack({
      Component: PreviewForm,
      props: {
        labels: labels,
        maxAccess: access,
        clientId,
        addressId
      },
      width: 800,
      height: 400,
      title: labels.preview
    })
  }

  const Delete = async obj => {
    await postRequest({
      extension: SaleRepository.Client.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const add = () => {
    openForm()
  }

  function openForm(recordId) {
    stack({
      Component: ClientsWindow,
      props: {
        labels: labels,
        recordId: recordId ? recordId : null,
        maxAccess: access
      },
      width: 700,
      height: 700,
      title: labels.clients
    })
  }

  const Edit = obj => {
    openForm(obj?.recordId)
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
          onAdd={add}
          maxAccess={access}
          onApply={onApply}
          onSearch={onSearch}
          onClear={onClear}
          reportName={'FIACC'}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          paginationParameters={paginationParameters}
          paginationType='api'
          refetch={refetch}
          onEdit={Edit}
          onDelete={Delete}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default SAClients
