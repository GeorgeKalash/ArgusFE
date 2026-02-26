import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { RemittanceOutwardsRepository } from '@argus/repositories/src/repositories/RemittanceOutwardsRepository'
import ReceiptVoucherForm from '@argus/shared-ui/src/components/Shared/Forms/ReceiptVoucherForm'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useDocumentTypeProxy } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import toast from 'react-hot-toast'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { getStorageData } from '@argus/shared-domain/src/storage/storage'
import { useError } from '@argus/shared-providers/src/providers/error'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

export default function RtReceiptVouchers() {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const userData = getStorageData('userData')

  const getCashAccountId = async () => {
    const res = await getRequest({
      extension: SystemRepository.UserDefaults.get,
      parameters: `_userId=${userData && userData.userId}&_key=cashAccountId`
    })

    if (res.record?.value) {
      return res.record.value
    }

    return ''
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
    endpointId: RemittanceOutwardsRepository.ReceiptVouchers.page,
    datasetId: ResourceIds.RemittanceReceiptVoucher,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function openForm(recordId) {
    const cashAccountId = await getCashAccountId()
    stack({
      Component: ReceiptVoucherForm,
      props: {
        recordId: recordId || null,
        cashAccountId: cashAccountId
      }
    })
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: RemittanceOutwardsRepository.ReceiptVouchers.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0 })
    }
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: RemittanceOutwardsRepository.ReceiptVouchers.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}`
    })

    return { ...response, _startAt: _startAt }
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.RemittanceReceiptVoucher,
    action: openForm
  })

  const getPlantId = async () => {
    const userData = getStorageData('userData')

    const res = await getRequest({
      extension: SystemRepository.UserDefaults.get,
      parameters: `_userId=${userData && userData.userId}&_key=plantId`
    })

    return res?.record?.value
  }

  const add = async () => {
    const plantId = await getPlantId()
    if (plantId !== '') {
      await proxyAction()
    } else {
      stackError({
        message: `The user does not have a default plant`
      })

      return
    }
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: RemittanceOutwardsRepository.ReceiptVouchers.del,
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
