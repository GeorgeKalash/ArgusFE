import React, { useContext, useEffect } from 'react'
import { Box, Grid } from '@mui/material'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { useState } from 'react'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { getNewRelationType, populateRelationType } from 'src/Models/BusinessPartner/RelationTypes'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import RelationTypeWindow from '../bp-relation-types/Windows/RelationTypeWindow'

const BpRelationTypes = () => {


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
    if (!access) getAccess(ResourceIds.BpRelationType, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 30 })

        // fillSysFunctionsStore()
        // fillActiveStatusStore()
        getLabels(ResourceIds.BpRelationType, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  const _labels = {
    reference: labels && labels.find(item => item.key === 1).value,
    name: labels && labels.find(item => item.key === 2).value,
    title: labels && labels.find(item => item.key === 3).value,

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
    }
  ]


  const RelationTypeValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),

    }),
    onSubmit: values => {
      console.log({ values })
      postRelationType(values)
    }
  })

  const addRelationType = () => {
    RelationTypeValidation.setValues(getNewRelationType())

    // setEditMode(false)
    setWindowOpen(true)
  }

  const delRelationType = obj => {
    postRequest({
      extension: BusinessPartnerRepository.RelationTypes.del,
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

  const editRelationType = obj => {

    RelationTypeValidation.setValues(populateRelationType(obj))

    // setEditMode(true)
    setWindowOpen(true)
  }

  const getGridData = ({ _startAt = 0, _pageSize = 30 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams + '&_dgId=0'

    getRequest({
      extension: BusinessPartnerRepository.RelationTypes.page,
      parameters: parameters
    })
      .then(res => {
        setGridData({ ...res, _startAt })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }



  const postRelationType = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: BusinessPartnerRepository.RelationTypes.set,
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
    RelationTypeValidation.handleSubmit()
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
        <GridToolbar onAdd={addRelationType} maxAccess={access} />

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
          RelationTypeValidation={RelationTypeValidation}
          labels={_labels}
          maxAccess={access}
        />
      )}
    </>
  )
}

export default BpRelationTypes
