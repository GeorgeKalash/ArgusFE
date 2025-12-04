import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { RemittanceOutwardsRepository } from '@argus/repositories/src/repositories/RemittanceOutwardsRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useError } from '@argus/shared-providers/src/providers/error'
import { useDocumentTypeProxy } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import InwardSettlementForm from '@argus/shared-ui/src/components/Shared/Forms/InwardSettlementForm'
import { getStorageData } from '@argus/shared-domain/src/storage/storage'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const InwardSettlement = () => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const userId = getStorageData('userData').userId

  const {
    query: { data },
    filterBy,
    paginationParameters,
    clearFilter,
    labels: _labels,
    refetch,
    access
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
      if (!filters.qry) return { list: [] }

      return await getRequest({
        extension: RemittanceOutwardsRepository.InwardSettlement.snapshot,
        parameters: `_filter=${filters.qry}`
      })
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

      return res?.record?.value
    } catch (error) {
      stackError(error)

      return ''
    }
  }

  const getCashAccountId = async () => {
    try {
      const res = await getRequest({
        extension: SystemRepository.UserDefaults.get,
        parameters: `_userId=${userId}&_key=cashAccountId`
      })

      return res?.record?.value
    } catch (error) {
      stackError(error)

      return ''
    }
  }

  const getDefaultDT = async () => {
    try {
      const res = await getRequest({
        extension: SystemRepository.UserFunction.get,
        parameters: `_userId=${userId}&_functionId=${SystemFunction.InwardSettlement}`
      })

      return res?.record?.dtId
    } catch (error) {
      stackError(error)

      return ''
    }
  }

  async function openForm(recordId) {
    const plantId = await getPlantId()
    const cashAccountId = await getCashAccountId()
    const dtId = await getDefaultDT()

    if (plantId && cashAccountId) {
      stack({
        Component: InwardSettlementForm,
        props: {
          plantId,
          cashAccountId,
          dtId,
          recordId
        }
      })
    } else {
      if (!plantId) {
        stackError({
          message: _labels.defaultPlant
        })

        return
      }
      if (!cashAccountId) {
        stackError({
          message: _labels.defaultCashAcc
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
      field: 'inwardRef',
      headerName: _labels.inwardReference,
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'clientRef',
      headerName: _labels.clientRef,
      flex: 1
    },
    {
      field: 'clientName',
      headerName: _labels.clientName,
      flex: 1
    },
    {
      field: 'corName',
      headerName: _labels.Correspondant,
      flex: 1
    },
    {
      field: 'token',
      headerName: _labels.token,
      flex: 1
    },
    {
      field: 'rsName',
      headerName: _labels.rsName,
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
    functionId: SystemFunction.InwardSettlement,
    action: openForm,
    hasDT: false
  })

  const addInward = () => {
    proxyAction()
  }

  const editInward = obj => {
    openForm(obj.recordId)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={addInward}
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
          onEdit={editInward}
          isLoading={false}
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

export default InwardSettlement
