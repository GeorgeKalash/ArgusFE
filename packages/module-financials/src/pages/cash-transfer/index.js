import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import CashTransferTab from '@argus/shared-ui/src/components/Shared/Forms/CashTransferTab'
import toast from 'react-hot-toast'
import { CashBankRepository } from '@argus/repositories/src/repositories/CashBankRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useError } from '@argus/shared-providers/src/providers/error'
import { useDocumentTypeProxy } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'
import { getStorageData } from '@argus/shared-domain/src/storage/storage'

const CashTransfer = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { userDefaults } = useContext(DefaultsContext)
  const { platformLabels } = useContext(ControlContext)
  const plantId = parseInt(userDefaults?.list?.find(({ key }) => key === 'plantId')?.value)
  const cashAccountId = parseInt(userDefaults?.list?.find(obj => obj.key === 'cashAccountId')?.value)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: CashBankRepository.CashTransfer.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}`
    })

    return { ...response, _startAt }
  }

  async function fetchWithSearch({ qry }) {
    const response = await getRequest({
      extension: CashBankRepository.CashTransfer.snapshot,
      parameters: `_filter=${qry}`
    })

    return response
  }

  const {
    query: { data },
    labels,
    refetch,
    access,
    invalidate,
    paginationParameters,
    search,
    clear
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CashBankRepository.CashTransfer.page,
    datasetId: ResourceIds.CashTransfer,
    search: {
      endpointId: CashBankRepository.CashTransfer.snapshot,
      searchFn: fetchWithSearch
    }
  })

  const userData = getStorageData('userData')

  const getDefaultDT = async () => {
    const res = await getRequest({
      extension: SystemRepository.UserFunction.get,
      parameters: `_userId=${userData?.userId}&_functionId=${SystemFunction.CashTransfer}`
    })

    return res.record?.dtId || null
  }

  async function openForm(recordId) {
    const dtId = await getDefaultDT()

    if (recordId) {
      openStack(recordId, dtId)
      return
    }

    if (!plantId) {
      stackError({ message: platformLabels.mustHaveDefaultPlant })
      return
    }

    if (!cashAccountId) {
      stackError({ message: platformLabels.mustHaveDefaultCashAcc })
      return
    }

    openStack(null, dtId)
  }

  function openStack(recordId, dtId) {
    stack({
      Component: CashTransferTab,
      props: {
        dtId,
        recordId
      }
    })
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.CashTransfer,
    action: openForm,
    hasDT: false
  })

  const columns = [
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
      field: 'fromPlantName',
      headerName: labels.fromPlant,
      flex: 1
    },
    {
      field: 'toPlantName',
      headerName: labels.toPlant,
      flex: 1
    },
    {
      field: 'fromCAName',
      headerName: labels.fromCashAcc,
      flex: 1
    },
    {
      field: 'toCAName',
      headerName: labels.toCashAcc,
      flex: 1
    },
    {
      field: 'rsName',
      headerName: labels.releaseStatus,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      type: 'badge',
      family: 'document',
      valueField: 'status',
      flex: 1
    },
    {
      field: 'wipName',
      headerName: labels.wip,
      type: 'badge',
      family: 'wip',
      valueField: 'wip',
      flex: 1
    }
  ]

  const add = async () => await proxyAction()

  const edit = obj => openForm(obj.recordId)

  const del = async obj => {
    await postRequest({
      extension: CashBankRepository.CashTransfer.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          onSearch={search} 
          onSearchClear={clear}
          labels={labels}
          inputSearch={true}
        />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default CashTransfer