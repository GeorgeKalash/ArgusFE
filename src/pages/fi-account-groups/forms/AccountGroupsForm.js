import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { MasterSource } from 'src/resources/MasterSource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'

export default function AccountGroupsForm({ labels, maxAccess, recordId, invalidate }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const editMode = !!recordId

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      reference: '',
      name: '',
      type: '',
      nraRef: '',
      nraDescription: '',
      nraId: ''
    },
    maxAccess: maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      type: yup.string().required('This field is required')
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: FinancialRepository.Group.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        toast.success('Record Added Successfully')
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      } else toast.success('Record Edited Successfully')
      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: FinancialRepository.Group.get,
            parameters: `_recordId=${recordId}`
          })
          formik.setValues(res.record)
        }
      } catch (e) {}
    })()
  }, [])

  const actions = [
    {
      key: 'Integration Account',
      condition: true,
      onClick: 'onClickGIA',
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.FlAccountGroups}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      masterSource={MasterSource.AccountGroup}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                maxAccess={maxAccess}
                maxLength='10'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
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
              <ResourceLookup
                endpointId={SystemRepository.NumberRange.snapshot}
                form={formik}
                valueField='reference'
                displayField='description'
                name='nraRef'
                label={labels.numberRange}
                secondDisplayField={true}
                secondValue={formik.values.nraDescription}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('nraId', newValue?.recordId)
                    formik.setFieldValue('nraRef', newValue?.reference)
                    formik.setFieldValue('nraDescription', newValue?.description)
                  } else {
                    formik.setFieldValue('nraId', null)
                    formik.setFieldValue('nraRef', '')
                    formik.setFieldValue('nraDescription', '')
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.FI_GROUP_TYPE}
                name='type'
                label={labels.type}
                valueField='key'
                required
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('type', newValue?.key || '')
                }}
                error={formik.touched.type && Boolean(formik.errors.type)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
