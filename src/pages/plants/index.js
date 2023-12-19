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
import ErrorWindow from 'src/components/Shared/ErrorWindow'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { ControlContext } from 'src/providers/ControlContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { getNewPlant, populatePlant } from 'src/Models/System/Plant'

// ** Helpers
import {getFormattedNumberMax, validateNumberField, getNumberWithoutCommas } from 'src/lib/numberField-helper'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Windows
import PlantWindow from './Windows/PlantWindow'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { FinancialRepository } from 'src/repositories/FinancialRepository'

const Plants = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //controls
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])
  const [costCenterStore, setCostCenterStore] = useState([])
  const [plantGroupStore, setPlantGroupStore] = useState([])
  const [segmentStore, setSegmentStore] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false) 
  const [errorMessage, setErrorMessage] = useState(null)

  const _labels = {
    reference: labels && labels.find(item => item.key === 1).value,
    name: labels && labels.find(item => item.key === 2).value,
    licenseNo: labels && labels.find(item => item.key === 3).value,
    commReg: labels && labels.find(item => item.key === 4).value,
    costCenter: labels && labels.find(item => item.key === 5).value,
    plantGrp: labels && labels.find(item => item.key === 6).value,
    segment: labels && labels.find(item => item.key === 7).value,
    plant: labels && labels.find(item => item.key === 8).value,
    address: labels && labels.find(item => item.key === 9).value,
    street1: labels && labels.find(item => item.key === 10).value,
    street2: labels && labels.find(item => item.key === 11).value,
    city: labels && labels.find(item => item.key === 12).value,
    phone: labels && labels.find(item => item.key === 13).value,
    email1: labels && labels.find(item => item.key === 14).value,
    email2: labels && labels.find(item => item.key === 15).value
  }

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
    },
    {
      field: 'costCenterName',
      headerName: _labels.costCenter,
      flex: 1
    }
  ]

  const plantValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      console.log(values)
      postPlant(values)
    }
  })

  const handleSubmit = () => {
    plantValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams
    getRequest({
      extension: SystemRepository.Plant.page,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)
        console.log(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postPlant = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: SystemRepository.Plant.set,
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
      })
  }

  const delPlant = obj => {
    postRequest({
      extension: SystemRepository.Plant.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        console.log({ res })
        getGridData({})
        toast.success('Record Deleted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addPlant = () => {
    plantValidation.setValues(getNewPlant)
    fillCostCenterStore()
    fillPlantGroupStore()
    fillSegmentStore()
    setEditMode(false)
    setWindowOpen(true)
  }

  const editPlant = obj => {
    console.log(obj)
    plantValidation.setValues(populatePlant(obj))
    fillCostCenterStore()
    fillPlantGroupStore()
    fillSegmentStore()
    setEditMode(true)
    setWindowOpen(true)
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.Plants, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 30 })
        fillCostCenterStore()
        fillPlantGroupStore()
        fillSegmentStore()
        getLabels(ResourceIds.Plants,setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  const fillCostCenterStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: GeneralLedgerRepository.CostCenter.qry,
      parameters: parameters
    })
      .then(res => {
        setCostCenterStore(res.list)
        console.log(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillPlantGroupStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.PlantGroup.qry,
      parameters: parameters
    })
      .then(res => {
        setPlantGroupStore(res.list)
        console.log(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillSegmentStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: FinancialRepository.Segment.qry,
      parameters: parameters
    })
      .then(res => {
        setSegmentStore(res.list)
        console.log(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
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
        <GridToolbar onAdd={addPlant} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editPlant}
          onDelete={delPlant}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
       <PlantWindow
       onClose={() => setWindowOpen(false)}
       width={600}
       height={450}
       onSave={handleSubmit}
       plantValidation={plantValidation}
       costCenterStore={costCenterStore}
       plantGroupStore={plantGroupStore}
       segmentStore={segmentStore}
       _labels ={_labels}
       maxAccess={access}
       editMode={editMode}
       />
       )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default Plants
