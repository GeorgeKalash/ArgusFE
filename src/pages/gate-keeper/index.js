// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

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
import { ControlContext } from 'src/providers/ControlContext'
import { getNewLean, populateLean } from 'src/Models/Manufacturing/Lean'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

const GateKeeper = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //states
  const [errorMessage, setErrorMessage] = useState(null)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  const _labels = {
    sku: labels && labels.find(item => item.key === "1").value,
    qty: labels && labels.find(item => item.key === "2").value,
    lean: labels && labels.find(item => item.key === "3").value,
    item: labels && labels.find(item => item.key === "4").value,
    reference: labels && labels.find(item => item.key === "5").value,
    date: labels && labels.find(item => item.key === "6").value,
    generateLean: labels && labels.find(item => item.key === "7").value,
  }

  const columns = [
    {
        field: 'sku',
        headerName: _labels.sku,
        flex: 1
      },
      {
        field: 'qty',
        headerName: _labels.qty,
        flex: 1
      },
      {
        field: 'status',
        headerName: _labels.lean,
        flex: 1
      },
      {
        field: 'itemName',
        headerName: _labels.item,
        flex: 1
      },
      {
        field: 'reference',
        headerName: _labels.reference,
        flex: 1
      },
      {
        field: 'date',
        headerName: _labels.date,
        flex: 1
      }
  ]

  const gateKeeperValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validate: values => {},
    initialValues: {
      rows: [
        {
          
        }
      ]
    },
    onSubmit: values => {
     generateLean(values.rows)
    }
  })

  const getGridData = () => {
    
  }

  const generateLean = obj => {
    /* const recordId = obj.recordId
       postRequest({
         extension: SystemRepository.SMSTemplate.set,
         record: JSON.stringify(obj)
       })
         .then(res => {
           getGridData({})
           setWindowOpen(false)
           if (!recordId) toast.success('Record Added Successfully')
           else toast.success('Record Edited Successfully')
         })
         .catch(error => {
           setErrorMessage(error)
         })*/
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.GateKeeper, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData()
        getLabels(ResourceIds.GateKeeper, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access])

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
      </Box>
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default GateKeeper
