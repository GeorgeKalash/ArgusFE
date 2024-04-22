// ** React Imports
import { useState, useContext } from 'react'

import { useWindow } from 'src/windows'

// ** MUI Imports
import { Box } from '@mui/material'
import toast from 'react-hot-toast'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'

import { useEffect } from 'react'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'

// ** Resources
import PreReqsForm from './PrereqForm'

const PreReqsList = ({ store, labels, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store

  const { stack } = useWindow()
  const [valueGridData, setValueGridData] = useState()

  const [refresh, setRefresh] = useState(false)

  //states

  const getValueGridData = recordId => {
    getRequest({
      extension: DocumentReleaseRepository.StrategyPrereq.qry,
      parameters: `&_strategyId=${recordId}`
    })
      .then(res => {
        setValueGridData(res)
      })
      .catch(error => {})
  }
  useEffect(() => {
    recordId && getValueGridData(recordId)
  }, [recordId, refresh])

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
    openForm()
  }

  const delCode = async obj => {
    await postRequest({
      extension: DocumentReleaseRepository.StrategyPrereq.del,
      record: JSON.stringify(obj)
    })
    setRefresh(prev => !prev)

    toast.success('Record Deleted Successfully')
  }

  function openForm(recordId) {
    stack({
      Component: PreReqsForm,
      props: {
        labels: labels,
        recordId: recordId ? recordId : null,
        maxAccess,
        store,
        setRefresh
      },
      width: 500,
      height: 400,
      title: labels.prere
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

export default PreReqsList
