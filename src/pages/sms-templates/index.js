// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import {Box } from '@mui/material'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'

// ** Windows
import SmsTemplatesWindow from './Windows/SmsTemplatesWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import useResourceParams from 'src/hooks/useResourceParams'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

const SmsTemplate = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
 
  //What should be placed for most pages
  const [tableData, setTableData] = useState([])
  const [selectedRecordId, setSelectedRecordId] = useState(null)

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)


  const { labels: _labels, access } = useResourceParams({
    datasetId: ResourceIds.SmsTemplates
  })

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'smsBody',
      headerName: _labels.smsBody,
      flex: 1
    }
  ]

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams

    getRequest({
      extension: SystemRepository.SMSTemplate.page,
      parameters: parameters
    })
      .then(res => {
        setTableData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const add = () => {
    setSelectedRecordId(null)
    setWindowOpen(true)
  }

  const edit = obj => {
    setSelectedRecordId(obj.recordId)
    setWindowOpen(true)
  }

  const del= obj => {
    postRequest({
      extension: SystemRepository.SMSTemplate.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        toast.success('Record Deleted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }
  
  useEffect(() => {
    if (access?.record?.maxAccess > 0) {
      getGridData({ _startAt: 0, _pageSize: 50 })
    }
  }, [access])

  return (
    <>
      <Box>
        <GridToolbar onAdd={add} maxAccess={access} />
        <Table
          columns={columns}
          gridData={tableData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <SmsTemplatesWindow
          onClose={() => {
            setWindowOpen(false)
            setSelectedRecordId(null)
          }}
          labels={_labels}
          maxAccess={access}
          recordId={selectedRecordId}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default SmsTemplate
