// ** React Importsport
import { useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

import { useWindow } from 'src/windows'
import CashTransferTab from './Tabs/CashTransferTab'
import toast from 'react-hot-toast'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'

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
    access
  } = useResourceQuery({
    endpointId: RemittanceOutwardsRepository.OutwardsTransfer.snapshot,
    datasetId: ResourceIds.CashTransfer,
    filter: {
      endpointId: RemittanceOutwardsRepository.OutwardsTransfer.snapshot,
      filterFn: fetchWithSearch
    }
  })
  async function fetchWithSearch({ options = {}, filters }) {
    const { _startAt = 0, _pageSize = 50 } = options

    /*return await getRequest({
      extension: RemittanceOutwardsRepository.CashTransfer.snapshot,
      parameters: `_filter=${filters.qry}`
    })*/
    return
  }

  const invalidate = useInvalidate({
    //  endpointId: RemittanceOutwardsRepository.CashTransfer.snapshot
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
  async function openForm(recordId) {
    try {
      const plantId = await getPlantId()
      const cashAccountId = await getCashAccountId()

      if (plantId !== '' && cashAccountId !== '') {
        openOutWardsWindow(plantId, cashAccountId, recordId)
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
      flex: 1
    },
    ,
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
      field: 'fromCashAccountName',
      headerName: _labels.fromCashAcc,
      flex: 1
    },
    {
      field: 'toCashAccountName',
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
    },
    {
      field: 'wipName',
      headerName: _labels.wip,
      flex: 1
    }
  ]

  const delCashTFR = async obj => {
    /* await postRequest({
      extension: RemittanceOutwardsRepository.CashTransfer.del,
      record: JSON.stringify(obj)
    })*/
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  const addCashTFR = () => {
    openForm('')
  }

  const editCashTFR = obj => {
    openForm(obj.recordId)
  }

  function openOutWardsWindow(plantId, cashAccountId, recordId) {
    stack({
      Component: CashTransferTab,
      props: {
        plantId: plantId,
        cashAccountId: cashAccountId,
        maxAccess: access,
        labels: _labels,
        recordId: recordId ? recordId : null
      },
      width: 950,
      height: 600,
      title: 'Cash Transfer'
    })
  }

  return (
    <>
      <Box>
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
        <Table
          columns={columns}
          gridData={data ? data : { list: [] }}
          rowId={['recordId']}
          onEdit={editCashTFR}
          onDelete={delCashTFR}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Box>

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default CashTransfer
