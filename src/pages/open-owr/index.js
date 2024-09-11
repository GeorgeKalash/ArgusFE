import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { useWindow } from 'src/windows'
import OutwardsReturnForm from '../outwards-return/Forms/OutwardsReturnForm'
import { KVSRepository } from 'src/repositories/KVSRepository'

const OpenOutwardsReturn = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, params } = options

    const response = await getRequest({
      extension: RemittanceOutwardsRepository.OutwardsReturn.qry2,
      parameters: `_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: RemittanceOutwardsRepository.OutwardsReturn.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  const {
    query: { data },
    labels: _labels,
    filterBy,
    clearFilter,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RemittanceOutwardsRepository.OutwardsReturn.qry2,
    datasetId: ResourceIds.OpenOutwardsReturn,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'currencyName',
      headerName: _labels.currency,
      flex: 1
    },
    {
      field: 'requestedByName',
      headerName: _labels.requestedBy,
      flex: 1
    },
    {
      field: 'clientName',
      headerName: _labels.client,
      flex: 1
    },
    {
      field: 'corName',
      headerName: _labels.corName,
      flex: 1
    },
    {
      field: 'amount',
      headerName: _labels.amount,
      flex: 1
    },
    {
      field: 'settlementStatusName',
      headerName: _labels.settlementStatus,
      flex: 1
    },
  ]

  async function getLabels(datasetId) {
    const res = await getRequest({
      extension: KVSRepository.getLabels,
      parameters: `_dataset=${datasetId}`
    })

    return res.list ? Object.fromEntries(res.list.map(({ key, value }) => [key, value])) : {}
  }

  async function openForm(recordId) {
    const labels = await getLabels(ResourceIds.OutwardsReturn)
    stack({
      Component: OutwardsReturnForm,
      props: {
        labels,
        recordId,
        maxAccess: access,
        isOpenOutwards: true,
        refetch
      },
      width: 800,
      height: 630,
      title: labels.outwardsReturn
    })
  }

  const edit = obj => {
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
          onSearch={onSearch}
          onClear={onClear}
          labels={_labels}
          onApply={onApply}
          reportName={'RTOWR'}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          isLoading={false}
          pageSize={50}
          onEdit={edit}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default OpenOutwardsReturn
