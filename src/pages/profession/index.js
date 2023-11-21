import React , {useContext, useEffect} from 'react'
import { Box, Grid} from '@mui/material'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { useState } from 'react'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ProfessionRepository } from 'src/repositories/ProfessionRepository'

import ProfessionWindow from './Windows/ProfessionWindow'
import { getFormattedNumber, validateNumberField, getNumberWithoutCommas } from 'src/lib/numberField-helper'
import { useFormik } from 'formik'
import { getNewProfession ,populateProfession  } from 'src/Models/CurrencyTradingSettings/Profession'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

const Professions = () => {



  const { getLabels, getAccess } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

    //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)


     //stores
     const [gridData, setGridData] = useState([])
     const [typeStore, setTypeStore] = useState([])

    //states
    const [activeTab, setActiveTab] = useState(0)
     const [windowOpen, setWindowOpen] = useState(false)
     const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    if (!access)
      getAccess(ResourceIds.Profession, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 30 })

        // fillSysFunctionsStore()
        // fillActiveStatusStore()
        getLabels(ResourceIds.Profession, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])


  const _labels = {
    reference: labels && labels.find(item => item.key === 1).value ,
    name: labels && labels.find(item => item.key === 2).value,
    flName: labels && labels.find(item => item.key === 3).value,
    monthlyIncome: labels && labels.find(item => item.key === 4).value,
    riskFactor: labels && labels.find(item => item.key === 5).value,
    profession: labels && labels.find(item => item.key === 6).value
  }

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1,
      editable: false
    },
    {

      field: 'name',
      headerName: _labels.name,
      flex: 1,
      editable: false
    },
    {

      field: 'flName',
      headerName: _labels.flName,
      flex: 1,
      editable: false
    },
    {
      field: 'monthlyIncome',
      headerName: _labels.monthlyIncome,
      flex: 1,
      editable: false
    },
    {
      field: 'riskFactor',
      headerName: _labels.riskFactor,
      flex: 1,
      editable: false
    }



  ]

  const addProfession = ()=>{
    ProfessionValidation.setValues(getNewProfession())

    // setEditMode(false)
    setWindowOpen(true)
  }



   const delProfession = obj => {
    postRequest({
      extension: ProfessionRepository.Profession.del,
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

   const editProfession = obj=>{
    ProfessionValidation.setValues(populateProfession(obj))

    // setEditMode(true)
    setWindowOpen(true)

   }

  const getGridData = ({ _startAt = 0, _pageSize = 30 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams + '&_dgId=0'

    getRequest({
      extension: ProfessionRepository.Profession.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData({ ...res, _startAt })
      })
      .catch(error => {
        // setErrorMessage(error)
      })
  }

  const ProfessionValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      flName: yup.string().required('This field is required'),
       monthlyIncome:yup
       .number()
       .transform((value, originalValue) => validateNumberField(value, originalValue))
       .min(0, 'Value must be greater than or equal to 0')
       .max(32767, 'Value must be less than or equal to 32,767'),
      riskFactor: yup.string().required('This field is required'),


    }),
    onSubmit: values => {
      console.log({ values })
      postProfession(values)
    }
  })



  const postProfession = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: ProfessionRepository.Profession.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        setWindowOpen(false)
        if (!recordId) toast.success('Record Added Successfully')
        else toast.success('Record Editted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }



  const handleSubmit = () => {
    ProfessionValidation.handleSubmit()
  }




return (
    <>
      <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >

             <GridToolbar  onAdd={addProfession} maxAccess={access} />

              <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          isLoading={false}
          maxAccess={access}
          onEdit={editProfession}
          onDelete={delProfession}
        />
      </Box>



      {windowOpen && (

<ProfessionWindow
onClose={() => setWindowOpen(false)}
width={600}
height={400}
onSave={handleSubmit}
ProfessionValidation={ProfessionValidation}
labels={_labels}
maxAccess={access}
  />


      )}


    </>
  )
}

export default Professions;
