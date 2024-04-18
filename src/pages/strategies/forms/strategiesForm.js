// ** MUI Imports
import { Grid } from '@mui/material'
import { DataSets } from 'src/resources/DataSets'

import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import { useFormik } from 'formik'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect, useState, useRef } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { useInvalidate } from 'src/hooks/resource'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

const StrategiesForm = ({ labels, editMode, maxAccess, setEditMode, setStore, store, onUpdateFormik }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: DocumentReleaseRepository.Strategy.qry
  })

  const [initialValues, setInitialData] = useState({
    recordId: null,
    name: '',
    group: '',
    type: '',
    groupId: ''
  })

  const strategiesFormik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues,
    validationSchema: yup.object({
      name: yup.string().required('This field is required'),
      groupId: yup.string().required('This field is required'),
      type: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postGroups(values)
    }
  })

  const prevValuesRef = useRef()

  useEffect(() => {
    if (prevValuesRef.current && formikValuesHaveChanged(prevValuesRef.current, strategiesFormik.values)) {
      onUpdateFormik(strategiesFormik)
    }
    prevValuesRef.current = strategiesFormik.values
  }, [strategiesFormik.values, onUpdateFormik])

  const formikValuesHaveChanged = (prevValues, newValues) => {
    return JSON.stringify(prevValues) !== JSON.stringify(newValues)
  }

  const postGroups = async obj => {
    const isNewRecord = !obj?.recordId
    try {
      const res = await postRequest({
        extension: DocumentReleaseRepository.Strategy.set,
        record: JSON.stringify(obj)
      })

      const message = isNewRecord ? 'Record Added Successfully' : 'Record Edited Successfully'
      toast.success(message)

      if (isNewRecord) {
        setStore(prevStore => ({
          ...prevStore,
          recordId: res.recordId
        }))
      }
      setEditMode(true)
      invalidate()
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  useEffect(() => {
    if (recordId) {
      getGroupId(recordId)
    }
  }, [recordId, getRequest])

  const getGroupId = recordId => {
    const defaultParams = `_recordId=${recordId}`
    getRequest({
      extension: DocumentReleaseRepository.Strategy.get,
      parameters: defaultParams
    })
      .then(res => {
        setInitialData(res.record)
        setEditMode(true)
      })
      .catch(error => {
        console.error('Error fetching group ID:', error)
      })
  }

  return (
    <FormShell form={strategiesFormik} resourceId={ResourceIds.Strategies} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={labels.name}
            value={strategiesFormik.values.name}
            required
            maxLength='50'
            maxAccess={maxAccess}
            onChange={strategiesFormik.handleChange}
            onClear={() => strategiesFormik.setFieldValue('name', '')}
            error={strategiesFormik.touched.name && Boolean(strategiesFormik.errors.name)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={DocumentReleaseRepository.DRGroup.qry}
            parameters='_startAt=0&_pageSize=100'
            name='groupId'
            label={labels.groupStrat}
            valueField='recordId'
            displayField='name'
            values={strategiesFormik.values}
            required
            readOnly={editMode}
            maxAccess={maxAccess}
            onClear={() => formik.setFieldValue('codeId', '')}
            onChange={(event, newValue) => {
              strategiesFormik && strategiesFormik.setFieldValue('groupId', newValue?.recordId)
            }}
            error={strategiesFormik.touched.groupId && Boolean(strategiesFormik.errors.groupId)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            datasetId={DataSets.SY_TYPE}
            name='type'
            label={labels.type}
            valueField='key'
            displayField='value'
            values={strategiesFormik.values}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              strategiesFormik.setFieldValue('type', newValue?.key)
            }}
            error={strategiesFormik.touched.type && Boolean(strategiesFormik.errors.type)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}

export default StrategiesForm
