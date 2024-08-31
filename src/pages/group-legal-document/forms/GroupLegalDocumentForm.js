import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import FormShell from 'src/components/Shared/FormShell'
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

export default function GroupLegalDocumentForm({ labels, maxAccess, recordId, record }) {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: BusinessPartnerRepository.GroupLegalDocument.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      groupId: '',
      incId: '',
      required: false,
      mandatory: false
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      groupId: yup.string().required(),
      incId: yup.string().required()
    }),
    onSubmit: async obj => {
      const groupId = formik.values.groupId
      const incId = formik.values.incId

      await postRequest({
        extension: BusinessPartnerRepository.GroupLegalDocument.set,
        record: JSON.stringify(obj)
      })

      if (!groupId && !incId) {
        toast.success('Record Added Successfully')
      } else toast.success('Record Edited Successfully')
      formik.setFieldValue('recordId', obj.groupId * 10000 + obj.incId)

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId || !!recordId

  useEffect(() => {
    ;(async function () {
      try {
        if (record && record.incId && record.groupId && recordId) {
          const res = await getRequest({
            extension: BusinessPartnerRepository.GroupLegalDocument.get,
            parameters: `_groupId=${record?.groupId}&_incId=${record?.incId}`
          })

          formik.setValues({
            ...res.record,
            recordId: res.record.groupId * 10000 + res.record.incId
          })
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.GroupLegalDocument}
      form={formik}
      height={300}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                readOnly={editMode}
                endpointId={BusinessPartnerRepository.Group.qry}
                name='groupId'
                label={labels.group}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: ' Ref' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('groupId', newValue?.recordId)
                }}
                error={formik.touched.groupId && Boolean(formik.errors.groupId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                readOnly={editMode}
                endpointId={BusinessPartnerRepository.CategoryID.qry}
                name='incId'
                label={labels.categoryId}
                valueField='recordId'
                displayField={'name'}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('incId', newValue?.recordId)
                }}
                error={formik.touched.incId && Boolean(formik.errors.incId)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='required'
                    valueField='recordId'
                    maxAccess={maxAccess}
                    checked={formik.values.required}
                    onChange={event => {
                      formik && formik.setFieldValue('required', event.target.checked)
                    }}
                  />
                }
                label={labels.required}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='mandatory'
                    valueField='recordId'
                    maxAccess={maxAccess}
                    checked={formik.values.mandatory}
                    onChange={event => {
                      formik && formik.setFieldValue('mandatory', event.target.checked)
                    }}
                  />
                }
                label={labels.mandatory}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
