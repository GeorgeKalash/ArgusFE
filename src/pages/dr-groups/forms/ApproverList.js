import { useState, useContext, useEffect } from 'react'
import { Box, toast } from '@mui/material'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import ApproverForm from './ApproverForm'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { useWindow } from 'src/windows'

const ApproverList = ({ store, labels, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store
  const [valueGridData, setValueGridData] = useState()
  const [refresh, setRefresh] = useState(false)
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const { stack } = useWindow()

  const fetchGridData = async recordId => {
    const parameters = `_filter=&_groupId=${recordId}`
    try {
      const response = await getRequest({
        extension: DocumentReleaseRepository.GroupCode.qry,
        parameters
      })
      setValueGridData(response)
    } catch (error) {
      setErrorMessage('Error fetching data')
      toast.error('Error fetching data')
    }
  }

  useEffect(() => {
    if (recordId) {
      fetchGridData(recordId)
    }
  }, [recordId, refresh])

  const columns = [
    { field: 'codeRef', headerName: labels.reference, flex: 1 },
    { field: 'codeName', headerName: labels.name, flex: 1 }
  ]

  const openForm = (recordId = null) => {
    stack({
      Component: ApproverForm,
      props: { labels, recordId, maxAccess, store, setRefresh },
      width: 500,
      height: 400,
      title: labels.approver
    })
  }

  const delApprover = async obj => {
    try {
      await postRequest({
        extension: DocumentReleaseRepository.GroupCode.del,
        record: JSON.stringify(obj)
      })
      setRefresh(prev => !prev)
      toast.success('Record Deleted Successfully')
    } catch (error) {}
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <GridToolbar onAdd={() => openForm()} maxAccess={maxAccess} />
      <Table
        columns={columns}
        gridData={valueGridData}
        rowId={['codeId']}
        isLoading={!valueGridData}
        pageSize={50}
        pagination={false}
        onDelete={obj => delApprover(obj)}
        maxAccess={maxAccess}
        height={200}
      />
    </Box>
  )
}

export default ApproverList
