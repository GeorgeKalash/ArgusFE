// ** React Imports
import { useState, useContext } from 'react'

// ** MUI Imports
import {Box } from '@mui/material'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'

import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'

// ** Windows
import CostCenterWindow from './Window/CostCenterWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'


// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

const CostCenter = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [selectedRecordId, setSelectedRecordId] = useState(null)

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [gridData ,setGridData]=useState([]);

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: GeneralLedgerRepository.CostCenter.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })
  }

  async function fetchWithSearch({options = {} , qry}) {
    const { _startAt = 0, _pageSize = 50 } = options

return await getRequest({
      extension: GeneralLedgerRepository.CostCenter.snapshot,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=${qry}`
    })
  }

  const {
    query: { data },
    search,
    clear,
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: GeneralLedgerRepository.CostCenter.page,
    datasetId: ResourceIds.CostCenter,
    search: {
      endpointId: GeneralLedgerRepository.CostCenter.snapshot,
      searchFn: fetchWithSearch,
    }
  })

  const invalidate = useInvalidate({
    endpointId: GeneralLedgerRepository.CostCenter.page
  })


  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },  {
        field: 'ccgName',
        headerName: _labels.costCenterGroup,
        flex: 1
      }
  ]

  const add = () => {
    setWindowOpen(true)
  }

  const edit = obj => {
    setSelectedRecordId(obj.recordId)
    setWindowOpen(true)
  }

  const del = async obj => {
    await postRequest({
      extension: GeneralLedgerRepository.CostCenter.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  return (
    <>
      <Box>
        <GridToolbar onAdd={add} maxAccess={access} onSearch={search} onSearchClear={clear} labels={_labels}  inputSearch={true}/>
        <Table
          columns={columns}
          gridData={  data ?? {list: []} }
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <CostCenterWindow
          onClose={() => {
            setWindowOpen(false)
            setSelectedRecordId(null)
          }}
          labels={_labels}
          maxAccess={access}
          recordId={selectedRecordId}

        //   onSubmit={(val) => {
        //     // search(val)

        //   }
        // }
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default CostCenter
