import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import toast from 'react-hot-toast'
import { CTTRXrepository } from '@argus/repositories/src/repositories/CTTRXRepository'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CreditOrderForm from '@argus/shared-ui/src/components/Shared/Forms/CreditOrderForm'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useDocumentTypeProxy } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useError } from '@argus/shared-providers/src/providers/error'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

const CreditOrder = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { userDefaults } = useContext(DefaultsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const plantId = parseInt(userDefaults?.list?.find(({ key }) => key === 'plantId')?.value)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: CTTRXrepository.CreditOrder.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithSearch({ qry }) {
    return await getRequest({
      extension: CTTRXrepository.CreditOrder.snapshot,
      parameters: `_filter=${qry}`
    })
  }

  const {
    query: { data },
    labels: labels,
    paginationParameters,
    search,
    refetch,
    clear,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CTTRXrepository.CreditOrder.page,
    datasetId: ResourceIds.CreditOrder,
    search: {
      endpointId: CTTRXrepository.CreditOrder.snapshot,
      searchFn: fetchWithSearch
    }
  })

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.CurrencyCreditOrderPurchase,
    action: openForm,
    hasDT: false
  })

  async function openForm(recordId) {
    if (!recordId && !plantId) {
      stackError({
        message: labels.defaultPlant
      })

      return
    }

    stack({
      Component: CreditOrderForm,
      props: {
        recordId
      }
    })
  }

  const add = async () => {
    proxyAction()
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: CTTRXrepository.CreditOrder.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          maxAccess={access}
          onAdd={add}
          onSearch={search}
          onSearchClear={clear}
          labels={labels}
          inputSearch={true}
        />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={[
            {
              field: 'reference',
              headerName: labels.reference,
              flex: 1
            },
            {
              field: 'date',
              headerName: labels.date,
              flex: 1,
              type: 'date'
            },
            {
              field: 'plantRef',
              headerName: labels.plant
            },
            {
              field: 'corName',
              headerName: labels.correspondent,
              flex: 1
            },
            {
              field: 'currencyRef',
              headerName: labels.currency,
              flex: 1
            },
            {
              field: 'amount',
              headerName: labels.amount,
              flex: 1,
              type: 'number'
            },
            {
              field: 'rsName',
              headerName: labels.releaseStatus,
              flex: 1
            },
            {
              field: 'statusName',
              headerName: labels.status,
              flex: 1
            },
            {
              field: 'wipName',
              headerName: labels.wip,
              flex: 1
            }
          ]}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          refetch={refetch}
          onDelete={del}
          pageSize={50}
          maxAccess={access}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default CreditOrder
