import { useContext } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import toast from 'react-hot-toast'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { CTTRXrepository } from 'src/repositories/CTTRXRepository'
import { useWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import CreditOrderForm from './Forms/CreditOrderForm'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useError } from 'src/error'
import { getStorageData } from 'src/storage/storage'

const CreditOrder = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const userData = getStorageData('userData').userId

  const getPlantId = async () => {
    const res = await getRequest({
      extension: SystemRepository.UserDefaults.get,
      parameters: `_userId=${userData}&_key=plantId`
    })

    return res?.record?.value
  }

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
    let plantId

    if (!recordId) {
      plantId = await getPlantId()
      if (!plantId) {
        stackError({
          message: labels.defaultPlant
        })

        return
      }
    }

    stack({
      Component: CreditOrderForm,
      props: {
        labels,
        access,
        plantId: plantId,
        userData: userData,
        recordId
      },
      width: 950,
      height: 600,
      title: labels.creditOrder
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
          isLoading={false}
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
