import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

// **  Resource Imports

import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import Resourcelookup from 'src/components/Shared/DataGrid/components/resourcelookup'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { DataSets } from 'src/resources/DataSets'

export default function DocumentTypeForm ({ labels, recordId, maxAccess }) {
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    name: '',
    reference: '',
    dgId:'',
    dgName: '',
    ilId: '',
    ilName:'',
    activeStatusName: '',
    nraRef: '',
    nraDescription:'',
    nraId:'',
  })

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.DocumentType.qry
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
        reference: yup.string().required(' '),
        name: yup.string().required(' '),
        dgName: yup.string().required(' '),
        activeStatusName: yup.string().required(' '),
      }),
      onSubmit: values => {
        postDocumentType(values)
      }
    })

    const postDocumentType = obj => {
      const recordId = obj.recordId
      postRequest({
        extension: SystemRepository.DocumentType.set,
        record: JSON.stringify(obj)
      })
      if (!recordId) {
        toast.success('Record Added Successfully')
        setInitialData({
          ...obj, // Spread the existing properties
          recordId: response.recordId // Update only the recordId field
        })
      } else toast.success('Record Edited Successfully')
      setEditMode(true)

      invalidate()
    }

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          setIsLoading(true)

          const res = await getRequest({
            extension: SystemRepository.DocumentType.get,
            parameters: `_recordId=${recordId}`
          })

          setInitialData(res.record)
        }
      } catch (exception) {
        setErrorMessage(error)
      }
      setIsLoading(false)
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.DocumentTypes}
      form={formik}
      height={400}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={labels.reference}
            value={formik.values.reference}
            required
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('reference', '')}
            maxAccess={maxAccess}
            editMode={editMode}
            maxLength={6}
            error={formik.touched.reference && Boolean(formik.errors.reference)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={labels.name}
            value={formik.values.name}
            required
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('name', '')}
            maxAccess={maxAccess}
            editMode={editMode}
            error={formik.touched.name && Boolean(formik.errors.name)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            datasetId={DataSets.SYSTEM_FUNCTION}
            name='dgId'
            label={labels.sysFunction}
            valueField='key'
            displayField='value'
            values={formik.values}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('dgId', newValue?.key)
              formik.setFieldValue('dgName', newValue?.value)
            }}
            error={formik.touched.dgName && Boolean(formik.errors.dgName)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={GeneralLedgerRepository.IntegrationLogic.qry}
            name='ilId'
            label={labels.intLogic}
            valueField='recordId'
            displayField='name'
            values={formik.values}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('ilId', newValue?.recordId)
              formik.setFieldValue('ilName', newValue?.name)
            }}
            error={formik.touched.ilId && Boolean(formik.errors.ilId)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            datasetId={DataSets.ACTIVE_STATUS}
            name='activeStatus'
            label={labels.activeStatusName}
            valueField='key'
            displayField='value'
            values={formik.values}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('activeStatus', newValue?.key)
              formik.setFieldValue('activeStatusName', newValue?.value)
            }}
            error={ formik.touched.activeStatusName && Boolean(formik.errors.activeStatusName)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceLookup
              endpointId={SystemRepository.NumberRange.snapshot}
              valueField='reference'
              displayField='description'
              name='nraRef'
              label={labels.nuRange}
              form={formik}
              secondDisplayField={true}
              firstValue={formik.values.nraRef}
              secondValue={formik.values.nraDescription}
              onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('nraId', newValue?.recordId)
                    formik.setFieldValue('nraRef', newValue?.reference)
                    formik.setFieldValue('nraDescription', newValue?.description)
                  } else {
                    formik.setFieldValue('nraId', null)
                    formik.setFieldValue('nraRef', null)
                    formik.setFieldValue('nraDescription', null)
                  }
              }}
              errorCheck={'nraId'}
              maxAccess={maxAccess}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
