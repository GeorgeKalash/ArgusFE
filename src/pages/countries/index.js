import { useState, useContext } from 'react'
import { Box } from '@mui/material'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { getFormattedNumberMax } from 'src/lib/numberField-helper'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import CountryForm from './forms/CountryForm'
import TableNew from 'src/components/Shared/TableNew'

const Countries = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  async function fetchGridData(options) {
    console.log('options', options)
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: SystemRepository.Country.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
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
    endpointId: SystemRepository.Country.page,
    datasetId: ResourceIds.Countries
  })

  const invalidate = useInvalidate({
    endpointId: SystemRepository.Country.page
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
    {
      field: 'flName',
      headerName: _labels.fLang,
      flex: 1
    },
    {
      field: 'currencyName',
      headerName: _labels.currency,
      flex: 1
    },
    {
      field: 'regionName',
      headerName: _labels.geoRegion,
      flex: 1
    },
    {
      field: 'ibanLength',
      headerName: _labels.ibanLength,
      flex: 1,
      align: 'right',

      valueGetter: ({ row }) => getFormattedNumberMax(row?.ibanLength, 5, 0)
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: SystemRepository.Country.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: CountryForm,
      props: {
        labels: _labels,
        recordId: recordId,
        maxAccess: access
      },
      width: 700,
      height: 640,
      title: _labels.country
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <TableNew
          columns={columns}
          gridData={data && data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          refetch={refetch}
          pageSize={50}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default Countries
