import { useState, useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import ExRatesForm from './ExRatesForm'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const ExchangeRates = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: MultiCurrencyRepository.ExchangeRates.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=&exId=`
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
    endpointId: MultiCurrencyRepository.ExchangeRates.page,
    datasetId: ResourceIds.ExchangeRates
  })

  const invalidate = useInvalidate({
    endpointId: MultiCurrencyRepository.ExchangeRates.page
  })

  const formatDate = dateStr => {
    const year = dateStr.substring(2, 4)
    const month = dateStr.substring(4, 6)
    const day = dateStr.substring(6, 8)

    return `${day}/${month}/${year}`
  }

  const columns = [
    {
      field: 'exName',
      headerName: _labels.exTable,
      flex: 1
    },

    {
      field: 'dayId',
      headerName: _labels.stDate,
      flex: 1,
      valueFormatter: ({ value }) => formatDate(value)
    },
    ,
    {
      field: 'rate',
      headerName: _labels.rate,
      flex: 1,
      valueFormatter: ({ value }) => {
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 5,
          useGrouping: true
        }).format(value)
      }
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: MultiCurrencyRepository.ExchangeRates.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  const edit = obj => {
    openForm(obj)
  }

  const add = () => {
    openForm()
  }

  function openForm(record) {
    stack({
      Component: ExRatesForm,
      props: {
        labels: _labels,
        record: record,
        maxAccess: access,
        recordId: record?.recordId || undefined
      },
      width: 500,
      height: 400,
      title: _labels.exRate
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} labels={_labels} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['exId', 'dayId', 'seqNo']}
          onEdit={edit}
          onDelete={del}
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

export default ExchangeRates
