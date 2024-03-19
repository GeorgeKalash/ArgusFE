// ** React Importsport
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, Button, Checkbox, FormControlLabel } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ControlContext } from 'src/providers/ControlContext'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

import { useWindow } from 'src/windows'
import OutwardsTab from './Tabs/OutwardsTab'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'

const OutwardsTransfer = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //stores
  const [gridData, setGridData] = useState(null)

  //states
  const [errorMessage, setErrorMessage] = useState(null)
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  const [plantId, setPlantId] = useState(null)
  const [cashAccountId, setCashAccountId] = useState(null)
  const { stack } = useWindow()
  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: RemittanceOutwardsRepository.OutwardsTransfer.qry,
      parameters: `_filter`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RemittanceOutwardsRepository.OutwardsTransfer.qry,
    datasetId: ResourceIds.OutwardsTransfer
  })

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.OutwardsTransfer.qry
  })

  const getPlantId = async () => {
    const userData = window.sessionStorage.getItem('userData')
      ? JSON.parse(window.sessionStorage.getItem('userData'))
      : null

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
  async function openForm() {
    try {
      const plantId = await getPlantId()
      const cashAccountId = await getCashAccountId()

      if (plantId !== '' && cashAccountId !== '') {
        setPlantId(plantId)
        setCashAccountId(cashAccountId)
        openOutWardsWindow()
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
      headerName: 'countryRef',
      flex: 1
    },
    {
      field: 'dispersalName',
      headerName: 'dispersalName',
      flex: 1
    },
    ,
    {
      field: 'currencyRef',
      headerName: 'currencyRef',
      flex: 1
    },
    {
      field: 'agent',
      headerName: 'agent',
      flex: 1
    }
  ]

  const delOutwards = obj => {}

  const addOutwards = () => {
    openForm()
  }

  function openOutWardsWindow() {
    stack({
      Component: OutwardsTab,
      props: {
        plantId: plantId,
        cashAccountId: cashAccountId,
        maxAccess: access,
        recordId: selectedRecordId
      },
      width: 800,
      height: 500,
      title: 'Outwards'
    })
  }

  const editOutwards = obj => {
    openForm()
    setSelectedRecordId(obj.recordId)
  }

  return (
    <>
      <Box>
        <GridToolbar onAdd={addOutwards} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
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
