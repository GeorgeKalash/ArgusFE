import React , {useContext, useEffect} from 'react'
import { Box, Grid} from '@mui/material'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { useState } from 'react'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'

import RelationTypeWindow from './Windows/RelationTypeWindow'

import { useFormik } from 'formik'
import { getNewRelationType ,populateRelationType  } from 'src/Models/CurrencyTradingSettings/RelationType'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

const RelationTypes = () => {



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
      getAccess(ResourceIds.RelationType, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 30 })

        // fillSysFunctionsStore()
        // fillActiveStatusStore()
        getLabels(ResourceIds.RelationType, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])


  const _labels = {
    reference: labels && labels.find(item => item.key === 1).value ,
    name: labels && labels.find(item => item.key === 2).value,
    flName: labels && labels.find(item => item.key === 3).value,
    relationtype: labels && labels.find(item => item.key === 4).value,
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
    }
  ]

  const addRelationType = ()=>{
    relationTypeValidation.setValues(getNewRelationType())

    // setEditMode(false)
    setWindowOpen(true)
  }



   const delRelationType = obj => {
    postRequest({
      extension: CurrencyTradingSettingsRepository.RelationType.del,
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

   const editRelationType = obj=>{
    relationTypeValidation.setValues(populateRelationType(obj))

    // setEditMode(true)
    setWindowOpen(true)

   }

  const getGridData = ({ _startAt = 0, _pageSize = 30 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams + '&_dgId=0'

    getRequest({
      extension: CurrencyTradingSettingsRepository.RelationType.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData({ ...res, _startAt })
      })
      .catch(error => {
        // setErrorMessage(error)
      })
  }

  const relationTypeValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      flName: yup.string().required('This field is required'),
    }),
    onSubmit: values => {
      console.log({ values })
      postRelationType(values)
    }
  })



  const postRelationType = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: CurrencyTradingSettingsRepository.RelationType.set,
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
    relationTypeValidation.handleSubmit()
  }


  // const fillTypeStore = () => {
  //   var parameters = '_database=3501' //add 'xml'.json and get _database values from there
  //   getRequest({
  //     extension: SystemRepository.KeyValueStore,
  //     parameters: parameters
  //   })
  //     .then(res => {
  //       setTypeStore(res.list)
  //     })
  //     .catch(error => {
  //       setErrorMsetTypeStoreessage(error)
  //     })
  // }

return (
    <>
      <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >

             <GridToolbar  onAdd={addRelationType} maxAccess={access} />

              <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          isLoading={false}
          maxAccess={access}
          onEdit={editRelationType}
          onDelete={delRelationType}
        />
      </Box>



      {windowOpen && (

<RelationTypeWindow
onClose={() => setWindowOpen(false)}
width={600}
height={400}
onSave={handleSubmit}
relationTypesValidation={relationTypeValidation}
labels={_labels}
maxAccess={access}
  />


      )}


    </>
  )
}

export default RelationTypes;
