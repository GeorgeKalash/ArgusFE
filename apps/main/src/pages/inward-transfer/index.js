import { useContext } from 'react'
import Table from '@argus/shared-ui/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/repositories/SystemRepository'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/hooks/resource'
import { useWindow } from '@argus/shared-providers/providers/windows'
import toast from 'react-hot-toast'
import { RemittanceOutwardsRepository } from '@argus/repositories/repositories/RemittanceOutwardsRepository'
import { SystemFunction } from '@argus/shared-domain/resources/SystemFunction'
import { Fixed } from '@argus/shared-ui/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/components/Layouts/VertLayout'
import { useError } from '@argus/shared-domain/lib/error'
import { useDocumentTypeProxy } from '@argus/shared-hooks/hooks/documentReferenceBehaviors'
import InwardTransferForm from './forms/InwardTransferForm'
import { getStorageData } from '@argus/shared-domain/storage/storage'
import { ControlContext } from '@argus/shared-providers/providers/ControlContext'

const InwardTransfer = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const userId = getStorageData('userData').userId
  const { platformLabels, userDefaultsData } = useContext(ControlContext)

  const {
    query: { data },
    filterBy,
    clearFilter,
    labels: _labels,
    refetch,
    access,
    invalidate
  } = useResourceQuery({
    endpointId: RemittanceOutwardsRepository.InwardsTransfer.snapshot,
    datasetId: ResourceIds.InwardTransfer,
    filter: {
      endpointId: RemittanceOutwardsRepository.InwardsTransfer.snapshot,
      filterFn: fetchWithSearch
    }
  })

  async function fetchWithSearch({ filters }) {
    try {
      if (!filters.qry) return { list: [] }

      const res = await getRequest({
        extension: RemittanceOutwardsRepository.InwardsTransfer.snapshot,
        parameters: `_filter=${filters.qry}`
      })

      res.list = res.list.map(item => {
        if (item.status === 4) {
          item.wip = 2
        }

        return item
      })

      return res
    } catch (error) {}
  }

  const getPlantId = async () => {
    const defaultPlant = userDefaultsData?.list?.find(({ key }) => key === 'plantId')

    return defaultPlant?.value ? parseInt(defaultPlant.value) : null
  }

  const getDefaultDT = async () => {
    try {
      const res = await getRequest({
        extension: SystemRepository.UserFunction.get,
        parameters: `_userId=${userId}&_functionId=${SystemFunction.InwardTransfer}`
      })

      return res?.record?.dtId
    } catch (error) {
      stackError(error)

      return ''
    }
  }

  async function openForm(recordId) {
    try {
      const plantId = await getPlantId()
      const dtId = await getDefaultDT()

      if (plantId) {
        openInwardTransferWindow(plantId, recordId, dtId)
      } else {
        stackError({
          message: platformLabels.mustHaveDefaultPlant
        })

        return
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
      type: 'date'
    },
    {
      field: 'currencyRef',
      headerName: _labels.currency,
      flex: 1
    },
    {
      field: 'amount',
      headerName: _labels.amount,
      flex: 1
    },
    {
      field: 'rsName',
      headerName: _labels.releaseStatus,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: _labels.status,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: _labels.wip,
      flex: 1
    }
  ]

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.InwardTransfer,
    action: openForm,
    hasDT: false
  })

  const delTransfer = async obj => {
    try {
      await postRequest({
        extension: RemittanceOutwardsRepository.InwardsTransfer.del,
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

  function openInwardTransferWindow(plantId, recordId, dtId) {
    stack({
      Component: InwardTransferForm,
      props: {
        plantId,
        dtId,
        userId,
        recordId
      }
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

export default InwardTransfer
