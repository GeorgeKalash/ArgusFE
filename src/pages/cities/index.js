import { useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Windows
import CityForm from 'src/pages/cities/Forms/CityForm'
import { useWindow } from 'src/windows'

// ** Helpers
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

const City = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: SystemRepository.City.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=&_countryId=0&_stateId=0`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access,
    search,
    clear,
    refetch,

    paginationParameters
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.City.page,
    datasetId: ResourceIds.Cities,
    search: {
      endpointId: SystemRepository.City.snapshot,
      searchFn: fetchWithSearch
    }
  })

  async function fetchWithSearch({ qry }) {
    const response = await getRequest({
      extension: SystemRepository.City.snapshot,
      parameters: `_filter=${qry}&_stateId=0&_countryId=0`
    })

    return response
  }

  const invalidate = useInvalidate({
    endpointId: SystemRepository.City.page
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    ,
    {
      field: 'countryName',
      headerName: _labels.country,
      flex: 1
    },
    {
      field: 'stateName',
      headerName: _labels.state,
      flex: 1
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: SystemRepository.City.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const add = () => {
    openForm()
  }

  function openForm(recordId) {
    stack({
      Component: CityForm,
      props: {
        labels: _labels,
        recordId: recordId,
        maxAccess: access
      },
      width: 500,
      height: 400,
      title: _labels.cities
    })
  }

  return (
    <>
      <Box>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          onSearch={search}
          onSearchClear={clear}
          labels={_labels}
          inputSearch={true}
        />
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          refetch={refetch}
          onEdit={edit}
          onDelete={del}
          maxAccess={access}
          isLoading={false}
          pageSize={50}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Box>
    </>
  )
}

export default City
