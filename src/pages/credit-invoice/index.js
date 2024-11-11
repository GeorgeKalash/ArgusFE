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
import CreditInvoiceForm from './Forms/CreditInvoiceForm'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useError } from 'src/error'
import { getStorageData } from 'src/storage/storage'

const CreditInvoice = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const userData = getStorageData('userData').userId

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: CTTRXrepository.CreditInvoice.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })
  }

  async function fetchWithSearch({ qry }) {
    return await getRequest({
      extension: CTTRXrepository.CreditInvoice.snapshot,
      parameters: `_filter=${qry}`
    })
  }

  const {
    query: { data },
    labels: _labels,
    search,
    clear,
    access,
    refetch,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CTTRXrepository.CreditInvoice.page,
    datasetId: ResourceIds.CreditInvoice,
    search: {
      endpointId: CTTRXrepository.CreditInvoice.snapshot,
      searchFn: fetchWithSearch
    }
  })

  async function getPlantId() {
    const res = await getRequest({
      extension: SystemRepository.UserDefaults.get,
      parameters: `_userId=${userData}&_key=plantId`
    })

    return res?.record?.value
  }

  const getCashAccountId = async () => {
    const res = await getRequest({
      extension: SystemRepository.UserDefaults.get,
      parameters: `_userId=${userData}&_key=cashAccountId`
    })

    return res?.record?.value
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.CreditInvoicePurchase,
    action: openForm,
    hasDT: false
  })

  const add = async () => {
    proxyAction()
  }

  async function openForm(recordId) {
    let plantId
    let cashAccountId

    if (!recordId) {
      plantId = await getPlantId()
      if (!plantId) {
        stackError({
          message: _labels.defaultPlant
        })

        return
      }
    }

    if (!recordId) cashAccountId = await getCashAccountId()

    stack({
      Component: CreditInvoiceForm,
      props: {
        _labels,
        access,
        plantId,
        userData,
        cashAccountId,
        recordId
      },
      width: 1000,
      title: _labels.creditInvoice
    })
  }

  const del = async obj => {
    await postRequest({
      extension: CTTRXrepository.CreditInvoice.del,
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
          labels={_labels}
          inputSearch={true}
        />
      </Fixed>
      <Grow>
        <Table
          columns={[
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
              field: 'plantRef',
              headerName: _labels.plant
            },
            {
              field: 'corName',
              headerName: _labels.correspondent,
              flex: 1
            },
            {
              field: 'currencyRef',
              headerName: _labels.currency,
              flex: 1
            },
            {
              field: 'cashAccountName',
              headerName: _labels.cashAccount,
              flex: 1
            },
            {
              field: 'amount',
              headerName: _labels.amount,
              flex: 1,
              type: 'number'
            },
            {
              field: 'statusName',
              headerName: _labels.status,
              flex: 1
            }
          ]}
          gridData={data}
          rowId={['recordId']}
          onEdit={obj => {
            openForm(obj.recordId)
          }}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          refetch={refetch}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default CreditInvoice
