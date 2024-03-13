// ** React Importsport
import { useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { getNewSalesPerson, populateSalesPerson } from 'src/Models/Sales/SalesPerson'
import { ResourceIds } from 'src/resources/ResourceIds'
import { CommonContext } from 'src/providers/CommonContext'

// ** Windows
import SalesPersonWindow from './Windows/SalesPersonWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

const SalesPerson = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  //states
  const [activeTab, setActiveTab] = useState(0)
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const {
    query: { data },
    labels: _labels,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SaleRepository.SalesPerson.qry,
    datasetId: ResourceIds.SalesPerson
  })

  const columns = [
    {
      field: 'spRef',
      headerName: _labels[1],
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels[2],
      flex: 1
    },
    {
      field: 'cellPhone',
      headerName: _labels[3],
      flex: 1
    },
    {
      field: 'username',
      headerName: _labels[5],
      flex: 1
    },
    {
      field: 'commissionPct',
      headerName: _labels[4],
      flex: 1
    }
  ]

  const tabs = [
    { label: _labels[8] },
    { label: _labels[9], disabled: !editMode },
    { label: _labels[15], disabled: !editMode }
  ]

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: SaleRepository.SalesPerson.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=`
    })
  }

  const invalidate = useInvalidate({
    endpointId: SaleRepository.SalesPerson.qry
  })

  const add = () => {
    setWindowOpen(true)
    setActiveTab(0)
    setEditMode(false)
  }

  const edit = obj => {
    setSelectedRecordId(obj.recordId)
    setWindowOpen(true)
    setActiveTab(0)
    setEditMode(true)
  }

  const del = async obj => {
    await postRequest({
      extension: SaleRepository.SalesPerson.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  return (
    <>
      <Box>
        <GridToolbar onAdd={add} maxAccess={access} />
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationType='client'
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <SalesPersonWindow
          onClose={() => {
            setWindowOpen(false)
            setSelectedRecordId(null)
          }}
          labels={_labels}
          maxAccess={access}
          activeTab={activeTab}
          tabs={tabs}
          editMode={editMode}
          setEditMode={setEditMode}
          setErrorMessage={setErrorMessage}
          setActiveTab={setActiveTab}
          recordId={selectedRecordId}
          setSelectedRecordId={setSelectedRecordId}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default SalesPerson
