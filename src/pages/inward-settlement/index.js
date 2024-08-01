import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
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
import InwardSettlementForm from './forms/InwardSettlementForm'
import { getStorageData } from 'src/storage/storage'
import { ControlContext } from 'src/providers/ControlContext'

const InwardSettlement = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const userId = getStorageData('userData').userId
  const { platformLabels } = useContext(ControlContext)

  const {
    query: { data },
    filterBy,
    clearFilter,
    labels: _labels,
    refetch,
    access,
    invalidate
  } = useResourceQuery({
    endpointId: RemittanceOutwardsRepository.InwardSettlement.snapshot,
    datasetId: ResourceIds.InwardSettlement,
    filter: {
      endpointId: RemittanceOutwardsRepository.InwardSettlement.snapshot,
      filterFn: fetchWithSearch
    }
  })

  async function fetchWithSearch({ filters }) {
    try {
      return (
        filters.qry &&
        (await getRequest({
          extension: RemittanceOutwardsRepository.InwardSettlement.snapshot,
          parameters: `_filter=${filters.qry}`
        }))
      )
    } catch (error) {
      stackError(error)
    }
  }

  const getPlantId = async () => {
    try {
      const res = await getRequest({
        extension: SystemRepository.UserDefaults.get,
        parameters: `_userId=${userId}&_key=plantId`
      })

      if (res.record?.value) {
        return res.record.value
      }

      return ''
    } catch (error) {
      stackError(error)
    }
  }

  const getCashAccountId = async () => {
    try {
      const res = await getRequest({
        extension: SystemRepository.UserDefaults.get,
        parameters: `_userId=${userId}&_key=cashAccountId`
      })

      if (res.record?.value) {
        return res.record.value
      }

      return ''
    } catch (error) {
      stackError(error)
    }
  }

  const getDefaultDT = async () => {
    try {
      const res = await getRequest({
        extension: SystemRepository.UserFunction.get,
        parameters: `_userId=${userId}&_functionId=${SystemFunction.InwardSettlement}`
      })
      if (res.record) {
        return res.record.dtId
      }

      return ''
    } catch (error) {
      stackError(error)
    }
  }

  async function openForm(recordId) {
    try {
      const plantId = await getPlantId()
      const cashAccountId = await getCashAccountId()
      const dtId = await getDefaultDT()

      if (plantId !== '' && cashAccountId !== '') {
        openInwardSettlementWindow(plantId, cashAccountId, recordId, dtId)
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
    } catch (error) {
      stackError(error)
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
      field: 'corName',
      headerName: _labels.corName,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: _labels.status,
      flex: 1
    },
    {
      field: 'token',
      headerName: _labels.token,
      flex: 1
    }
  ]

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.InwardSettlement,
    action: openForm,
    hasDT: false
  })

  const delTransfer = async obj => {
    try {
      await postRequest({
        extension: RemittanceOutwardsRepository.InwardSettlement.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (error) {
      stackError(error)
    }
  }

  const addTransfer = () => {
    proxyAction()
  }

  const editTransfer = obj => {
    openForm(obj.recordId)
  }

  function openInwardSettlementWindow(plantId, cashAccountId, recordId, dtId) {
    stack({
      Component: InwardSettlementForm,
      props: {
        plantId,
        cashAccountId,
        dtId,
        access,
        userId,
        labels: _labels,
        recordId
      },
      width: 1200,
      title: _labels.InwardSettlement
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
          gridData={data}
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

export default InwardSettlement
