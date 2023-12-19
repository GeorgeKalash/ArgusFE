import React, { useContext, useEffect } from 'react'
import { Box, Grid } from '@mui/material'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { useState } from 'react'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { getFormattedNumberMax} from 'src/lib/numberField-helper'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { getNewCategoryId, populateCategoryId } from 'src/Models/BusinessPartner/CategoryID'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import IdCategoryWindow from './Windows/IdCategoryWindow'

const IdCategories = () => {


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
    if (!access) getAccess(ResourceIds.IdCategories, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 30 })

        // fillSysFunctionsStore()
        // fillActiveStatusStore()
        getLabels(ResourceIds.IdCategories, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  const _labels = {
    name: labels && labels.find(item => item.key === 1).value,
    org: labels && labels.find(item => item.key === 2).value,
    person: labels && labels.find(item => item.key === 3).value,
    group: labels && labels.find(item => item.key === 4).value,
    unique: labels && labels.find(item => item.key === 5).value,
    title: labels && labels.find(item => item.key === 6).value

  }

  const columns = [

    {
      field: 'name',
      headerName: _labels.name,
      flex: 1,
      editable: false
    }
  ]


  const IdCategoryValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      name: yup.string().required('This field is required'),

    }),
    onSubmit: values => {
      postIdCategory(values)
    }
  })

  const addIdCategory = () => {
    IdCategoryValidation.setValues(getNewCategoryId())

    // setEditMode(false)
    setWindowOpen(true)
  }

  const delIdCategory = obj => {
    postRequest({
      extension: BusinessPartnerRepository.CategoryID.del,
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

  const editIdCategory = obj => {

    IdCategoryValidation.setValues(populateCategoryId(obj))

    setWindowOpen(true)
  }

  const getGridData = ({ _startAt = 0, _pageSize = 30 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams + '&_dgId=0'

    getRequest({
      extension: BusinessPartnerRepository.CategoryID.page,
      parameters: parameters
    })
      .then(res => {
        setGridData({ ...res, _startAt })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }



  const postIdCategory = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: BusinessPartnerRepository.CategoryID.set,
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
    IdCategoryValidation.handleSubmit()
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
        <GridToolbar onAdd={addIdCategory} maxAccess={access} />

        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          isLoading={false}
          maxAccess={access}
          onEdit={editIdCategory}
          onDelete={delIdCategory}
        />
      </Box>

      {windowOpen && (
        <IdCategoryWindow
          onClose={() => setWindowOpen(false)}
          width={600}
          height={400}
          onSave={handleSubmit}
          IdCategoryValidation={IdCategoryValidation}
          labels={_labels}
          maxAccess={access}
        />
      )}
    </>
  )
}

export default IdCategories
