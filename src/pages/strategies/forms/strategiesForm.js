// ** MUI Imports
import { Grid } from '@mui/material'
import { DataSets } from 'src/resources/DataSets'

import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'

import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect, useState, useRef } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { useInvalidate } from 'src/hooks/resource'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ControlContext } from 'src/providers/ControlContext'
import { useForm } from 'src/hooks/form'

const StrategiesForm = ({ labels, maxAccess, setStore, store, onChange }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: DocumentReleaseRepository.Strategy.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: null,
      name: '',
      type: '',
      groupId: ''
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(' '),
      groupId: yup.string().required(' '),
      type: yup.string().required(' ')
    }),
    onSubmit: async values => {
      await postGroups(values)
    }
  })

  const editMode = !!recordId

  useEffect(() => {
    onChange(formik.values)
  }, [formik.values])

  const postGroups = async obj => {
    const isNewRecord = !obj?.recordId
    try {
      const res = await postRequest({
        extension: DocumentReleaseRepository.Strategy.set,
        record: JSON.stringify(obj)
      })

      const message = isNewRecord ? platformLabels.Added : platformLabels.Edited
      toast.success(message)

      if (isNewRecord) {
        formik.setFieldValue('recordId', res.recordId)
        setStore(prevStore => ({
          ...prevStore,
          recordId: res.recordId
        }))
      }

      invalidate()
    } catch {}
  }

  useEffect(() => {
    if (recordId) {
      getStrategyId(recordId)
    }
  }, [])

  const getStrategyId = recordId => {
    const defaultParams = `_recordId=${recordId}`
    getRequest({
      extension: DocumentReleaseRepository.Strategy.get,
      parameters: defaultParams
    })
      .then(res => {
        formik.setValues(res.record)
      })
      .catch(error => {})
  }

  return (
    <FormShell form={formik} resourceId={ResourceIds.PhysicalProperty} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={labels.name}
            value={formik.values.name}
            required
            maxLength='50'
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('name', '')}
            error={formik.touched.name && Boolean(formik.errors.name)}
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
            values={formik.values}
            required
            readOnly={editMode}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik && formik.setFieldValue('groupId', newValue?.recordId)
            }}
            error={formik.touched.groupId && Boolean(formik.errors.groupId)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            datasetId={DataSets.SY_TYPE}
            name='type'
            label={labels.type}
            valueField='key'
            displayField='value'
            values={formik.values}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('type', newValue?.key)
            }}
            error={formik.touched.type && Boolean(formik.errors.type)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}

export default StrategiesForm
