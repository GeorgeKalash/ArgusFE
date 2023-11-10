// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { getNewLegalStatuses, populateLegalStatuses } from 'src/Models/System/BusinessPartner/LegalStatuses'

// ** Windows
import LegalStatusWindow from './Windows/LegalStatusWindow'

const LegalStatus = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  //stores
  const [gridData, setGridData] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const columns = [
    {
      field: 'reference',
      headerName: 'Reference',
      flex: 1
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1
    }
  ]

  const legalStatusValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,

    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postLegalStatus(values)
    }
  })

  const handleSubmit = () => {
    legalStatusValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    console.log(_startAt)
    console.log(_pageSize)
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams
    console.log(parameters)

        // var parameters = defaultParams + '&_dgId=0'
        getRequest({
            'extension': BusinessPartnerRepository.LegalStatus.qry,
            'parameters': parameters,
        })
            .then((res) => {
                setGridData({ ...res, _startAt })
            })
            .catch((error) => {
                setErrorMessage(error)
            })
    }

    const postLegalStatus = (obj) => {
        const recordId = obj.recordId
        postRequest({
            'extension': BusinessPartnerRepository.LegalStatus.set,
            'record': JSON.stringify(obj),
        })
            .then((res) => {
                getGridData({})
                setWindowOpen(false)
                if (!recordId)
                    toast.success('Record Added Successfully')
                else
                    toast.success('Record Edited Successfully')
            })
            .catch((error) => {
                setErrorMessage(error)
            })
    }

    const delLegalStatus = (obj) => {
        postRequest({
            'extension': BusinessPartnerRepository.LegalStatus.del,
            'record': JSON.stringify(obj),
        })
            .then((res) => {
                console.log({ res })
                getGridData({})
                toast.success('Record Deleted Successfully')
            })
            .catch((error) => {
                setErrorMessage(error)
            })
    }

  const addLegalStatus = () => {
    legalStatusValidation.setValues(getNewLegalStatuses())
    setEditMode(false)
    setWindowOpen(true)
  }

  const editLegalStatus = obj => {
    legalStatusValidation.setValues(populateLegalStatuses(obj))
    setEditMode(true)
    setWindowOpen(true)
  }

  useEffect(() => {
    getGridData({ _startAt: 0, _pageSize: 30 })
  })

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <GridToolbar onAdd={addLegalStatus} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editLegalStatus}
          onDelete={delLegalStatus}
          isLoading={false}
        />
      </Box>
      {windowOpen && (
       <LegalStatusWindow
       onClose={() => setWindowOpen(false)}
       width={600}
       height={400}
       onSave={handleSubmit}
       legalStatusValidation={legalStatusValidation}
       />
       )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default LegalStatus
