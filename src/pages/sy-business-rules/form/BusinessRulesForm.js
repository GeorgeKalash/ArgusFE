import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { DataSets } from 'src/resources/DataSets'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

export default function BusinessRulesForm({ labels, obj, window, maxAccess }) {
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.BusinessRules.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      resourceId: '',
      moduleId: '',
      ruleEndPoint: null,
      ruleId: null,
      trxType: '',
      isActive: false
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,

    validationSchema: yup.object({
      moduleId: yup.string().required(),
      resourceId: yup.string().required(),
      ruleId: yup.string().required(),
      ruleEndPoint: yup.string().required(),
      trxType: yup.string().required()
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: SystemRepository.BusinessRules.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success(platformLabels.Added)
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      } else toast.success(platformLabels.Edited)

      invalidate()
      window.close()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (obj?.recordId) {
        const res = await getRequest({
          extension: SystemRepository.BusinessRules.get,
          parameters: `_recordId=${obj.recordId}`
        })

        formik.setValues({
          ...res.record,
          moduleId: parseInt(res.record.resourceId / 1000).toString()
        })
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.BusinessRules}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.MODULE}
                label={labels.module}
                name='moduleId'
                values={formik.values}
                valueField='key'
                displayField='value'
                readOnly={editMode}
                required
                onChange={(event, newValue) => {
                  formik.setFieldValue('moduleId', newValue ? newValue.key : '')
                  formik.setFieldValue('resourceId', '')
                  formik.setFieldValue('ruleId', '')
                }}
                error={formik.touched.moduleId && Boolean(formik.errors.moduleId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={formik.values.moduleId && SystemRepository.ModuleClassRES.qry}
                parameters={`_moduleId=${formik.values.moduleId}&_filter=`}
                label={labels.res}
                readOnly={!formik.values.moduleId || editMode}
                name='resourceId'
                values={formik.values}
                required
                valueField='key'
                displayField='value'
                onChange={(event, newValue) => {
                  formik.setFieldValue('resourceId', newValue ? newValue.key : '')
                  formik.setFieldValue('trxType', newValue ? newValue.key : '')
                }}
                error={formik.touched.resourceId && Boolean(formik.errors.resourceId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={formik.values.resourceId && SystemRepository.Rules.qry}
                parameters={`_resourceId=${formik.values.resourceId}&_filter=`}
                name='ruleId'
                label={labels.rule}
                readOnly={!formik.values.resourceId || editMode}
                valueField='seqNo'
                required
                displayField='description'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('ruleId', newValue ? newValue?.seqNo : '')
                }}
                error={formik.touched.ruleId && Boolean(formik.errors.ruleId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.RULE_END_POINT}
                name='ruleEndPoint'
                label={labels.ruleEnd}
                readOnly={editMode}
                required
                valueField='key'
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('ruleEndPoint', newValue?.key || null)
                }}
                error={formik.touched.ruleEndPoint && Boolean(formik.errors.ruleEndPoint)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.TRX_TYPE}
                readOnly={editMode}
                name='trxType'
                required
                label={labels.ttype}
                valueField='key'
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('trxType', newValue?.key || null)
                }}
                error={formik.touched.trxType && Boolean(formik.errors.trxType)}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='isActive'
                    maxAccess={maxAccess}
                    checked={formik.values?.isActive}
                    onChange={formik.handleChange}
                  />
                }
                label={labels.isActive}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
