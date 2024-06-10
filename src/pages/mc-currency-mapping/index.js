import { useState, useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import MultiCurrencyForm from './forms/MultiCurrencyForm'

const MultiCurrencyMapping = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: MultiCurrencyRepository.McExchangeMap.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const invalidate = useInvalidate({
    endpointId: MultiCurrencyRepository.McExchangeMap.page
  })

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: MultiCurrencyRepository.McExchangeMap.page,
    datasetId: ResourceIds.MultiCurrencyMapping
  })

  const columns = [
    {
      field: 'currencyName',
      headerName: _labels.currency,
      flex: 1
    },
    {
      field: 'rateTypeName',
      headerName: _labels.rateType,
      flex: 1
    },
    {
      field: 'exName',
      headerName: _labels.exchangeTable,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const popup = obj => {
    openForm(obj?.currencyId, obj?.rateTypeId)
  }

  const del = async obj => {
    await postRequest({
      extension: MultiCurrencyRepository.McExchangeMap.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  function openForm(currencyId, rateTypeId) {
    stack({
      Component: MultiCurrencyForm,
      props: {
        labels: _labels,
        currencyId: currencyId ? currencyId : null,
        rateTypeId: rateTypeId ? rateTypeId : null,
        maxAccess: access,
        invalidate: invalidate
      },
      width: 600,
      height: 300,
      title: _labels.mc_mapping
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['currencyId', 'rateTypeId']}
          onEdit={popup}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationType='api'
          maxAccess={access}
          refetch={refetch}
          paginationParameters={paginationParameters}
        />
      </Grow>
    </VertLayout>
  )
}

export default MultiCurrencyMapping
