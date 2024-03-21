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
import OutwardsTab from './Tabs/OutwardsTab'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'

const OutwardsTransfer = () => {
  const { getRequest } = useContext(RequestsContext)

  //states
  const [errorMessage, setErrorMessage] = useState(null)
  const { stack } = useWindow()
  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: RemittanceOutwardsRepository.OutwardsTransfer.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RemittanceOutwardsRepository.OutwardsTransfer.page,
    datasetId: ResourceIds.OutwardsTransfer
  })

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.OutwardsTransfer.page
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
    const userData = window.sessionStorage.getItem('userData')
      ? JSON.parse(window.sessionStorage.getItem('userData'))
      : null

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
      field: 'agentName',
      headerName: _labels.Agents,
      flex: 1
    }
  ]

  const delOutwards = async obj => {
    await postRequest({
      extension: RemittanceOutwardsRepository.OutwardsTransfer.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  const addOutwards = () => {
    openForm('')
  }

  const editOutwards = obj => {
    openForm(obj.recordId)
  }

  function openOutWardsWindow(plantId, cashAccountId, recordId) {
    stack({
      Component: OutwardsTab,
      props: {
        plantId: plantId,
        cashAccountId: cashAccountId,
        userId: userData && userData.userId,
        maxAccess: access,
        _labels: _labels,
        recordId: recordId
      },
      width: 800,
      height: 550,
      title: 'Outwards'
    })
  }

  return (
    <>
      <Box>
        <GridToolbar onAdd={addOutwards} maxAccess={access} />
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={editOutwards}
          onDelete={delOutwards}
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

export default OutwardsTransfer
