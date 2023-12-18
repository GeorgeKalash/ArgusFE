import React, { useContext, useEffect } from 'react'
import { Box, Grid } from '@mui/material'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { useState } from 'react'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import GroupsWindow from './Windows/GroupsWindow'
import { getFormattedNumberMax} from 'src/lib/numberField-helper'
import { useFormik } from 'formik'
import { getNewGroup, populateGroup } from 'src/Models/BusinessPartner/Group'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

const Groups = () => {


  const { getLabels, getAccess } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])
  const [typeStore, setTypeStore] = useState([])
  const [numberRangeStore, setNumberRangeStore] = useState([])

  //states
  const [activeTab, setActiveTab] = useState(0)
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    if (!access) getAccess(ResourceIds.Groups, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 30 })

        // fillSysFunctionsStore()
        // fillActiveStatusStore()
        getLabels(ResourceIds.Groups, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  const _labels = {
    reference: labels && labels.find(item => item.key === 1).value,
    name: labels && labels.find(item => item.key === 2).value,
    numberRange: labels && labels.find(item => item.key === 3).value,
    title: labels && labels.find(item => item.key === 4).value,
    accountGroup: labels && labels.find(item => item.key === 5).value,
    typeName: labels && labels.find(item => item.key === 6).value,
    sameNumber: labels && labels.find(item => item.key === 7).value,
    title2: labels && labels.find(item => item.key === 8).value,
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
      field: 'nraName',
      headerName: _labels.numberRange,
      flex: 1,
      editable: false
    },

  ]

  const addGroup = () => {
    GroupsValidation.setValues(getNewGroup())

    setEditMode(false)
    setActiveTab(0)
    setWindowOpen(true)
  }

  const tabs = [
    { label: _labels.title },
    { label: _labels.title2, disabled: !editMode },

  ]

  const delGroup = obj => {
    postRequest({
      extension: BusinessPartnerRepository.Groups.del,
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

  const editGroup = obj => {

    GroupsValidation.setValues(populateGroup(obj))

    console.log(obj)
    setActiveTab(0)
    setEditMode(true)
    setWindowOpen(true)
  }

  const getGridData = ({ _startAt = 0, _pageSize = 30 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams + '&_dgId=0'

    getRequest({
      extension: BusinessPartnerRepository.Groups.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData({ ...res, _startAt })
      })
      .catch(error => {
        // setErrorMessage(error)
      })
  }

  const lookupNumberRange = searchQry => {
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}`
    getRequest({
      extension: SystemRepository.NumberRange.snapshot,
      parameters: parameters
    })
      .then(res => {
        setNumberRangeStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const GroupsValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      nraId: yup.string().required('This field is required')

    }),
    onSubmit: values => {
      console.log({ values })
      postGroups(values)
    }
  })

  const postGroups = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: BusinessPartnerRepository.Groups.set,
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
    GroupsValidation.handleSubmit()
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
        <GridToolbar onAdd={addGroup} maxAccess={access} />

        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          isLoading={false}
          maxAccess={access}
          onEdit={editGroup}
          onDelete={delGroup}
        />
      </Box>

      {windowOpen && (
        <GroupsWindow
          onClose={() => setWindowOpen(false)}
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}

          width={600}
          height={400}
          onSave={handleSubmit}
          GroupsValidation={GroupsValidation}
          labels={_labels}
          maxAccess={access}
          lookupNumberRange={lookupNumberRange}
          setNumberRangeStore={setNumberRangeStore}
          numberRangeStore={numberRangeStore}
          editMode={editMode}
        />
      )}
    </>
  )
}

export default Groups
