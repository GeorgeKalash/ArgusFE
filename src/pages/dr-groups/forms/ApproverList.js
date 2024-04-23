// ** React Imports
import { useState, useContext } from 'react'

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

import ApproverForm from './ApproverForm'

const ApproverList = ({ store, labels, maxAccess }) => {
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
      extension: DocumentReleaseRepository.GroupCode.qry,
      parameters: `_filter=&_groupId=${recordId}`
    })
      .then(res => {
        setValueGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }
  useEffect(() => {
    recordId && getValueGridData(recordId)
  }, [recordId, refresh])

  const columns = [
    {
      field: 'codeRef',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'codeName',
      headerName: labels.name,
      flex: 1
    }
  ]

  const addApprover = () => {
    openForm()
  }

  const delApprover = async obj => {
    await postRequest({
      extension: DocumentReleaseRepository.GroupCode.del,
      record: JSON.stringify(obj)
    })
    setRefresh(prev => !prev)

    toast.success('Record Deleted Successfully')
  }

  function openForm(recordId) {
    stack({
      Component: ApproverForm,
      props: {
        labels: labels,
        recordId: recordId ? recordId : null,
        maxAccess,
        store,
        setRefresh
      },
      width: 500,
      height: 400,
      title: labels.approver
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
      <GridToolbar onAdd={addApprover} maxAccess={maxAccess} />
      <Table
        columns={columns}
        gridData={valueGridData}
        rowId={['codeId']}
        isLoading={false}
        pageSize={50}
        pagination={false}
        onDelete={delApprover}
        maxAccess={maxAccess}
        height={200}
      />
    </Box>
  )
}

export default ApproverList

// import { useContext } from 'react'
// import { Box } from '@mui/material'
// import GridToolbar from 'src/components/Shared/GridToolbar'
// import Table from 'src/components/Shared/Table'
// import { RequestsContext } from 'src/providers/RequestsContext'
// import { FinancialRepository } from 'src/repositories/FinancialRepository'
// import { useResourceQuery } from 'src/hooks/resource'
// import { ResourceIds } from 'src/resources/ResourceIds'

// const AccountBalanceForm = (
//  {
//   labels,
//   height,
//   maxAccess,
//   store,
// }) => {
//   const { getRequest} = useContext(RequestsContext)
//   const { recordId } = store
//   var editMode = recordId? true: false

//   const columns = [
//     {
//       field: 'currencyName',
//       headerName: labels.currency,
//       flex: 1
//     },
//     {
//       field: 'balance',
//       headerName: labels.balance,
//       flex: 1
//     }
//   ]

//   async function fetchGridData(options={}) {
//     const { _startAt = 0, _pageSize = 50 } = options

//     const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&_accountId=${recordId}`
//     var parameters = defaultParams

//      const response =  await getRequest({
//       extension: FinancialRepository.AccountCreditBalance.qry,
//       parameters: parameters
//     })

//     return {...response,  _startAt: _startAt}
//   }

//   const {
//     query: { data },
//   } = useResourceQuery({
//     enabled: editMode,
//     queryFn: fetchGridData,
//     endpointId: FinancialRepository.AccountCreditBalance.qry,
//     datasetId: ResourceIds.Accounts,
//   })

//   return (
//     <>
//       <Box>
//         <GridToolbar maxAccess={maxAccess} />
//         <Table
//           columns={columns}
//           gridData={data}
//           rowId={['currencyId']}
//           isLoading={false}
//           maxAccess={maxAccess}
//           pagination={false}
//           height={height-50}
//         />
//       </Box>
//     </>
//   )
// }

// export default AccountBalanceForm
