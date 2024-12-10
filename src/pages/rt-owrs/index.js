import { useContext } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useWindow } from 'src/windows'
import Table from 'src/components/Shared/Table'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { SystemFunction } from 'src/resources/SystemFunction'
import toast from 'react-hot-toast'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { useError } from 'src/error'
import { ControlContext } from 'src/providers/ControlContext'
import OutwardReturnSettlementForm from './Forms/OutwardReturnSettlementForm'

export default function RtOutwardReturnSettlement() {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, userDefaultsData } = useContext(ControlContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()

  async function getDefaultData() {
    const userKeys = ['cashAccountId', 'plantId']

    const userDefault = (userDefaultsData?.list || []).reduce((acc, { key, value }) => {
      if (userKeys.includes(key)) {
        acc[key] = value ? parseInt(value) : null
      }

      return acc
    }, {})

    return {
      cashAccountId: parseInt(userDefault?.cashAccountId),
      plantId: parseInt(userDefault?.plantId)
    }
  }

  const {
    query: { data },
    filterBy,
    clearFilter,
    labels: labels,
    access,
    paginationParameters,
    refetch,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RemittanceOutwardsRepository.OutwardReturnSettlement.page,
    datasetId: ResourceIds.OutwardReturnSettlement,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function openForm(recordId) {
    const { cashAccountId, plantId } = await getDefaultData()
    stack({
      Component: OutwardReturnSettlementForm,
      props: {
        labels,
        access,
        recordId,
        cashAccountId,
        plantId
      },
      width: 1200,
      height: 500,
      title: labels.outwardReturnSettlement
    })
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: RemittanceOutwardsRepository.OutwardReturnSettlement.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0 })
    }
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: RemittanceOutwardsRepository.OutwardReturnSettlement.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}`
    })

    return { ...response, _startAt: _startAt }
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.OutwardReturnSettlement,
    action: openForm
  })

  const add = async () => {
    const { plantId } = await getDefaultData()
    if (plantId !== '') {
      await proxyAction()
    } else {
      stackError({
        message: platformLabels.mustHaveDefaultPlant
      })

      return
    }
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: RemittanceOutwardsRepository.OutwardReturnSettlement.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const onSearch = value => {
    filterBy('qry', value)
  }

  const onClear = () => {
    clearFilter('qry')
  }

  const columns = [
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'owoRef',
      headerName: labels.outwardOrder,
      flex: 1
    },
    {
      field: 'amount',
      headerName: labels.amount,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} onSearch={onSearch} onSearchClear={onClear} inputSearch={true} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          onEdit={edit}
          onDelete={del}
          gridData={data ? data : { list: [] }}
          rowId={['recordId']}
          isLoading={false}
          refetch={refetch}
          paginationParameters={paginationParameters}
          pageSize={50}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}
