import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { companyStructureRepository } from '@argus/repositories/src/repositories/companyStructureRepository'
import { AdministrationRepository } from '@argus/repositories/src/repositories/AdministrationRepository'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi } from '@argus/shared-domain/src/lib/date-helper'

export default function HrRightToWorkForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.RightToWork.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      branchId: null,
      dtId: null,
      documentRef: '',
      divisionId: null,
      remarks: '',
      expiryDate: null,
      issueDate: null
    },
    maxAccess,
    validationSchema: yup.object({
      dtId: yup.number().required(),
      documentRef: yup.string().required(),
      issueDate: yup
        .date()
        .required()
        .test(function (value) {
          const { expiryDate } = this.parent

          return value.getTime() <= expiryDate?.getTime()
        }),
      expiryDate: yup
        .date()
        .required()
        .test(function (value) {
          const { issueDate } = this.parent

          return value.getTime() >= issueDate?.getTime()
        })
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: SystemRepository.RightToWork.set,
        record: JSON.stringify(obj)
      })

      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
      if (!obj.recordId) {
        formik.setFieldValue('recordId', response.recordId)
      }
      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: SystemRepository.RightToWork.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues({
          ...res?.record,
          issueDate: formatDateFromApi(res?.record.issueDate),
          expiryDate: formatDateFromApi(res?.record.expiryDate)
        })
      }
    })()
  }, [])

  const actions = [
    {
      key: 'Attachment',
      condition: true,
      onClick: 'onClickAttachment',
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.RightToWork}
      form={formik}
      actions={actions}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={companyStructureRepository.BranchFilters.qry}
                name='branchId'
                label={labels.branch}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('branchId', newValue?.recordId || null)
                }}
                error={formik.touched.branchId && Boolean(formik.errors.branchId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={AdministrationRepository.DocumentType.qry}
                name='dtId'
                readOnly={editMode}
                label={labels.docType}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId || null)
                }}
                required
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='documentRef'
                label={labels.documentRef}
                value={formik.values.documentRef}
                required
                maxAccess={maxAccess}
                maxLength='20'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('documentRef', '')}
                error={formik.touched.documentRef && Boolean(formik.errors.documentRef)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='remarks'
                label={labels.remarks}
                value={formik.values.remarks}
                maxLength='255'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('remarks', null)}
                error={formik.touched.remarks && Boolean(formik.errors.remarks)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='expiryDate'
                label={labels.expiryDate}
                value={formik.values?.expiryDate}
                required
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('expiryDate', null)}
                error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='issueDate'
                label={labels.issueDate}
                required
                value={formik.values?.issueDate}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('issueDate', '')}
                error={formik.touched.issueDate && Boolean(formik.errors.issueDate)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={companyStructureRepository.DivisionFilters.qry}
                name='divisionId'
                label={labels.division}
                valueField='recordId'
                displayField={'name'}
                maxAccess={maxAccess}
                values={formik.values}
                onChange={(_, newValue) => {
                  formik.setFieldValue('divisionId', newValue?.recordId || null)
                }}
                error={formik.touched.divisionId && Boolean(formik.errors.divisionId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
