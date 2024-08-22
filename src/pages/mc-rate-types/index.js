import { useState, useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import RateTypesForm from './forms/RateTypesForm'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'

const RateTypes = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const [errorMessage, setErrorMessage] = useState(null)
  const { platformLabels } = useContext(ControlContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: MultiCurrencyRepository.RateType.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithSearch({ options = {}, filters }) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: MultiCurrencyRepository.RateType.snapshot,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=${filters.qry}`
    })
  }

  const invalidate = useInvalidate({
    endpointId: MultiCurrencyRepository.RateType.page
  })

  const {
    query: { data },
    labels: labels,
    filterBy,
    clearFilter,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: MultiCurrencyRepository.RateType.page,
    datasetId: ResourceIds.RateType,
    filter: {
      filterFn: fetchWithSearch
    }
  })

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
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const del = async obj => {
    try {
      await postRequest({
        extension: MultiCurrencyRepository.RateType.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (error) {}
  }

  function openForm(recordId) {
    stack({
      Component: RateTypesForm,
      props: {
        labels: labels,
        recordId: recordId ? recordId : null,
        maxAccess: access,
        invalidate: invalidate
      },
      width: 600,
      height: 300,
      title: labels.rateType
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          onSearch={value => {
            filterBy('qry', value)
          }}
          onSearchClear={() => {
            clearFilter('qry')
          }}
          labels={labels}
          inputSearch={true}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
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

export default RateTypes
