import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import toast from 'react-hot-toast'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { formatDateDefault } from 'src/lib/date-helper'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { useError } from 'src/error'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import InwardTransferForm from './forms/InwardTransferForm'

const InwardTransfer = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const userId = JSON.parse(window.sessionStorage.getItem('userData'))?.userId

  const {
    query: { data },
    filterBy,
    clearFilter,
    labels: _labels,
    refetch,
    access
  } = useResourceQuery({
    endpointId: RemittanceOutwardsRepository.InwardsTransfer.snapshot,
    datasetId: ResourceIds.InwardTransfer,
    filter: {
      endpointId: RemittanceOutwardsRepository.InwardsTransfer.snapshot,
      filterFn: fetchWithSearch
    }
  })

  async function fetchWithSearch({ filters }) {
    return (
      filters.qry &&
      (await getRequest({
        extension: RemittanceOutwardsRepository.InwardsTransfer.snapshot,
        parameters: `_filter=${filters.qry}`
      }))
    )
  }

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.InwardsTransfer.snapshot
  })

  const userData = window.sessionStorage.getItem('userData')
    ? JSON.parse(window.sessionStorage.getItem('userData'))
    : null

  const getPlantId = async () => {
    const res = await getRequest({
      extension: SystemRepository.UserDefaults.get,
      parameters: `_userId=${userData && userData.userId}&_key=plantId`
    })

    if (res.record?.value) {
      return res.record.value
    }

    return ''
  }

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

  const getDefaultDT = async () => {
    const res = await getRequest({
      extension: SystemRepository.UserFunction.get,
      parameters: `_userId=${userData && userData.userId}&_functionId=${SystemFunction.InwardTransfer}`
    })
    if (res.record) {
      return res.record.dtId
    }

    return ''
  }
  async function openForm(recordId) {
    const plantId = await getPlantId()
    const cashAccountId = await getCashAccountId()
    const dtId = await getDefaultDT()

    if (plantId !== '' && cashAccountId !== '') {
      openInwardTransferWindow(plantId, cashAccountId, recordId, dtId)
    } else {
      if (plantId === '') {
        stackError({
          message: `This user does not have a default plant.`
        })

        return
      }
      if (cashAccountId === '') {
        stackError({
          message: `This user does not have a default cash account.`
        })

        return
      }
    }
  }

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
      valueGetter: ({ row }) => formatDateDefault(row?.date)
    },
    {
      field: 'currencyRef',
      headerName: _labels.currency,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: _labels.status,
      flex: 1
    },
    {
      field: 'amount',
      headerName: _labels.amount,
      flex: 1
    }
  ]

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.InwardTransfer,
    action: openForm
  })

  const delTransfer = async obj => {
    await postRequest({
      extension: RemittanceOutwardsRepository.InwardsTransfer.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  const addTransfer = () => {
    proxyAction()
  }

  const editTransfer = obj => {
    openForm(obj.recordId)
  }

  function openInwardTransferWindow(plantId, cashAccountId, recordId, dtId) {
    stack({
      Component: InwardTransferForm,
      props: {
        plantId: plantId,
        cashAccountId: cashAccountId,
        dtId: dtId,
        access,
        userId,
        labels: _labels,
        recordId: recordId ? recordId : null
      },
      width: 1200,
      title: _labels.InwardTransfer
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={addTransfer}
          maxAccess={access}
          onSearch={value => {
            filterBy('qry', value)
          }}
          onSearchClear={() => {
            clearFilter('qry')
          }}
          labels={_labels}
          inputSearch={true}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data ? data : { list: [] }}
          rowId={['recordId']}
          onEdit={editTransfer}
          onDelete={delTransfer}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationType='client'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default InwardTransfer
