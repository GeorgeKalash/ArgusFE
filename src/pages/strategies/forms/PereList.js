// ** React Imports
import { useState, useContext } from 'react'
import { useFormik } from 'formik'
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import { useWindow } from 'src/windows'

// ** MUI Imports
import { Box } from '@mui/material'
import toast from 'react-hot-toast'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import * as yup from 'yup'

import { useEffect } from 'react'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'

import CodeForm from './CodeForm'

// ** Helpers
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import PereForm from './PereForm'

const PereList = ({ store, labels, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  const { stack } = useWindow()
  const [valueGridData, setValueGridData] = useState()

  const [refresh, setRefresh] = useState(false)

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const getValueGridData = recordId => {
    getRequest({
      extension: DocumentReleaseRepository.StrategyPrereq.qry,
      parameters: `&_strategyId=${recordId}`
    })
      .then(res => {
        setValueGridData(res)
        console.log('resss', res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }
  useEffect(() => {
    recordId && getValueGridData(recordId)
  }, [recordId, refresh])

  // const {
  //   query: { data },
  //   labels: _labels,
  //   access
  // } = useResourceQuery({
  //   queryFn: fetchGridData,
  //   endpointId: DocumentReleaseRepository.GroupCode.qry,
  //   datasetId: ResourceIds.DRGroups
  // })

  const columns = [
    {
      field: 'code',
      headerName: labels.code,
      flex: 1
    },
    {
      field: 'prerequisiteCode',
      headerName: labels.prerequisite,
      flex: 1
    }
  ]

  const addCode = () => {
    openForm2()
  }

  const delCode = async obj => {
    await postRequest({
      extension: DocumentReleaseRepository.StrategyPrereq.del,
      record: JSON.stringify(obj)
    })
    setRefresh(prev => !prev)

    toast.success('Record Deleted Successfully')
  }

  function openForm2(recordId) {
    stack({
      Component: PereForm,
      props: {
        labels: labels,
        recordId: recordId ? recordId : null,
        maxAccess,
        store,
        setRefresh
      },
      width: 500,
      height: 400,
      title: labels.code
    })
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <GridToolbar onAdd={addCode} maxAccess={maxAccess} />
      <Table
        columns={columns}
        gridData={valueGridData}
        rowId={['code']}
        isLoading={false}
        pageSize={50}
        pagination={false}
        onDelete={delCode}
        maxAccess={maxAccess}
        height={200}
      />
    </Box>
  )
}

export default PereList
