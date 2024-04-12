// ** React Imports
import { useContext, useState } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Windows
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import AddressForm from 'src/components/Shared/AddressForm'

const AddressBook = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const [address, setAddress] = useState([])

  async function fetchWithSearch({ qry }) {
    const response = await getRequest({
      extension: SystemRepository.Address.snapshot,
      parameters: `_filter=${qry}`
    })

    return response
  }

  const {
    query: { data },
    search,
    clear,
    refetch,
    labels: _labels,
    paginationParameters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.Address.qry,
    datasetId: ResourceIds.Address,
    search: {
      endpointId: SystemRepository.Address.snapshot,
      searchFn: fetchWithSearch
    }
  })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams

    const response = await getRequest({
      extension: SystemRepository.Address.qry,
      parameters: parameters
    })

    return { ...response, _startAt: _startAt }
  }

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'countryName',
      headerName: _labels.country,
      flex: 1
    },
    {
      field: 'stateName',
      headerName: _labels.state,
      flex: 1
    },
    {
      field: 'city',
      headerName: _labels.city,
      flex: 1
    },
    {
      field: 'street1',
      headerName: _labels.street1,
      flex: 1
    },
    {
      field: 'phone',
      headerName: _labels.phone,
      flex: 1
    },
    {
      field: 'email1',
      headerName: _labels.email1,
      flex: 1
    }
  ]

  const invalidate = useInvalidate({
    endpointId: SystemRepository.Address.qry
  })

  const editAddress = obj => {
    setAddress(obj)
    openForm(obj)
  }

  function openForm(obj) {
    stack({
      Component: AddressForm,
      props: {
        editMode: true,
        labels: _labels,
        setAddress: setAddress,
        address: obj,
        recordId: obj.recordId,
        onSubmit: onSubmitFunction
      },
      width: 600,
      height: 600,
      title: _labels.address
    })
  }

  const onSubmitFunction = async obj => {
    invalidate()
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <GridToolbar maxAccess={access} onSearch={search} onSearchClear={clear} labels={_labels} inputSearch={true} />
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={editAddress}
          refetch={refetch}
          paginationType='api'
          paginationParameters={paginationParameters}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Box>
    </>
  )
}

export default AddressBook
