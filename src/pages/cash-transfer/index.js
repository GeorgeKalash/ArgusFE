import { useState, useContext } from 'react'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import CashTransferTab from './Tabs/CashTransferTab'
import toast from 'react-hot-toast'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { formatDateDefault } from 'src/lib/date-helper'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'

const CashTransfer = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)

  //states
  const [errorMessage, setErrorMessage] = useState(null)
  const { stack } = useWindow()

  const {
    query: { data },
    filterBy,
    clearFilter,
    labels: _labels,
    refetch,
    access
  } = useResourceQuery({
    endpointId: CashBankRepository.CashTransfer.snapshot,
    datasetId: ResourceIds.CashTransfer,
    filter: {
      endpointId: CashBankRepository.CashTransfer.snapshot,
      filterFn: fetchWithSearch
    }
  })
  async function fetchWithSearch({ options = {}, filters }) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: CashBankRepository.CashTransfer.snapshot,
      parameters: `_filter=${filters.qry}`
    })

    return
  }

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.CashTransfer.snapshot
  })

  const userData = window.sessionStorage.getItem('userData')
    ? JSON.parse(window.sessionStorage.getItem('userData'))
    : null

  const getPlantId = async () => {
    const parameters = `_userId=${userData && userData.userId}&_key=plantId`

    try {
      const res = await getRequest({
        extension: SystemRepository.UserDefaults.get,
        parameters: parameters
      })

      if (res.record.value) {
        return res.record.value
      }

      return ''
    } catch (error) {
      setErrorMessage(error)

      return ''
    }
  }

  const getCashAccountId = async () => {
    const parameters = `_userId=${userData && userData.userId}&_key=cashAccountId`

    try {
      const res = await getRequest({
        extension: SystemRepository.UserDefaults.get,
        parameters: parameters
      })

      if (res.record.value) {
        return res.record.value
      }

      return ''
    } catch (error) {
      setErrorMessage(error)

      return ''
    }
  }

  const getDefaultDT = async () => {
    const parameters = `_userId=${userData && userData.userId}&_functionId=${SystemFunction.CashTransfer}`

    try {
      const res = await getRequest({
        extension: SystemRepository.UserFunction.get,
        parameters: parameters
      })
      if (res.record) {
        return res.record.dtId
      }

      return ''
    } catch (error) {
      setErrorMessage(error)

      return ''
    }
  }
  async function openForm(recordId) {
    try {
      const plantId = await getPlantId()
      const cashAccountId = await getCashAccountId()
      const dtId = await getDefaultDT()

      if (plantId !== '' && cashAccountId !== '') {
        openCashTransferWindow(plantId, cashAccountId, recordId, dtId)
      } else {
        if (plantId === '') {
          setErrorMessage({ error: 'The user does not have a default plant' })
        }
        if (cashAccountId === '') {
          setErrorMessage({ error: 'The user does not have a default cash account' })
        }
        setWindowOpen(false)
      }
    } catch (error) {
      console.error(error)
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
      field: 'fromPlantName',
      headerName: _labels.fromPlant,
      flex: 1
    },
    {
      field: 'toPlantName',
      headerName: _labels.toPlant,
      flex: 1
    },
    {
      field: 'fromCAName',
      headerName: _labels.fromCashAcc,
      flex: 1
    },
    {
      field: 'toCAName',
      headerName: _labels.toCashAcc,
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
    }
  ]

  const delCashTFR = async obj => {
    await postRequest({
      extension: CashBankRepository.CashTransfer.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  const addCashTFR = () => {
    openForm('')
  }

  const editCashTFR = obj => {
    openForm(obj.recordId)
  }

  function openCashTransferWindow(plantId, cashAccountId, recordId, dtId) {
    stack({
      Component: CashTransferTab,
      props: {
        plantId: plantId,
        cashAccountId: cashAccountId,
        dtId: dtId,
        maxAccess: access,
        labels: _labels,
        recordId: recordId ? recordId : null
      },
      width: 950,
      title: 'Cash Transfer'
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={addCashTFR}
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
          onEdit={editCashTFR}
          onDelete={delCashTFR}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationType='client'
          maxAccess={access}
        />
      </Grow>
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </VertLayout>
  )
}

export default CashTransfer
