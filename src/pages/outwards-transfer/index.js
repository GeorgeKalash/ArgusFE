import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import OutwardsForm from './Tabs/OutwardsForm'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useError } from 'src/error'
import { getStorageData } from 'src/storage/storage'
import { ControlContext } from 'src/providers/ControlContext'

const OutwardsTransfer = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { platformLabels } = useContext(ControlContext)

  const {
    query: { data },
    filterBy,
    refetch,
    clearFilter,
    labels: _labels,
    access,
    invalidate
  } = useResourceQuery({
    endpointId: RemittanceOutwardsRepository.OutwardsTransfer.snapshot,
    datasetId: ResourceIds.OutwardsTransfer,
    filter: {
      endpointId: RemittanceOutwardsRepository.OutwardsTransfer.snapshot,
      filterFn: fetchWithSearch
    }
  })
  async function fetchWithSearch({ filters }) {
    try {
      if (!filters.qry) {
        return { list: [] }
      } else {
        return await getRequest({
          extension: RemittanceOutwardsRepository.OutwardsTransfer.snapshot,
          parameters: `_filter=${filters.qry}`
        })
      }
    } catch (error) {}
  }

  const userData = getStorageData('userData')

  const getPlantId = async () => {
    try {
      const res = await getRequest({
        extension: SystemRepository.UserDefaults.get,
        parameters: `_userId=${userData && userData.userId}&_key=plantId`
      })

      if (res.record.value) {
        return res.record.value
      }

      return ''
    } catch (error) {
      return ''
    }
  }

  const getCashAccountId = async () => {
    try {
      const res = await getRequest({
        extension: SystemRepository.UserDefaults.get,
        parameters: `_userId=${userData && userData.userId}&_key=cashAccountId`
      })

      if (res.record.value) {
        return res.record.value
      }

      return ''
    } catch (error) {
      return ''
    }
  }
  async function openForm(recordId) {
    try {
      const plantId = await getPlantId()
      const cashAccountId = await getCashAccountId()

      if (plantId !== '' && cashAccountId !== '') {
        openOutWardsWindow(plantId, cashAccountId, recordId)
      } else {
        if (plantId === '') {
          stackError({
            message: `The user does not have a default plant.`
          })
        }
        if (cashAccountId === '') {
          stackError({
            message: `The user does not have a default cash account.`
          })
        }
      }
    } catch (error) {}
  }

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'countryRef',
      headerName: _labels.CountryRef,
      flex: 1
    },
    {
      field: 'dispersalName',
      headerName: _labels.DispersalName,
      flex: 1
    },
    ,
    {
      field: 'currencyRef',
      headerName: _labels.Currency,
      flex: 1
    },
    {
      field: 'rsName',
      headerName: _labels.ReleaseStatus,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: _labels.Status,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: _labels.WIP,
      flex: 1
    }
  ]

  const delOutwards = async obj => {
    try {
      await postRequest({
        extension: RemittanceOutwardsRepository.OutwardsTransfer.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (error) {}
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.Outwards,
    action: openForm,
    hasDT: false
  })

  const getDefaultDT = async () => {
    const res = await getRequest({
      extension: SystemRepository.UserFunction.get,
      parameters: `_userId=${userData.userId}&_functionId=${SystemFunction.Outwards}`
    })

    return res?.record?.dtId
  }

  const addOutwards = async () => {
    await proxyAction()
  }

  const editOutwards = obj => {
    openForm(obj.recordId)
  }

  async function openOutWardsWindow(plantId, cashAccountId, recordId) {
    const dtId = await getDefaultDT()
    stack({
      Component: OutwardsForm,
      props: {
        plantId: plantId,
        cashAccountId: cashAccountId,
        userId: userData.userId,
        access,
        labels: _labels,
        recordId: recordId,
        invalidate,
        dtId
      },
      width: 1100,
      height: 600,
      title: _labels.OutwardsTransfer
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={addOutwards}
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
          onEdit={editOutwards}
          onDelete={delOutwards}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
          refetch={refetch}
        />
      </Grow>
    </VertLayout>
  )
}

export default OutwardsTransfer
