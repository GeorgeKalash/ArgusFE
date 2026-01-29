import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

export default function DocumentTypeMapForm({ labels, maxAccess, recordId, record }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.DocumentTypeMap.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      fromFunctionId: '',
      fromDTId: '',
      toFunctionId: '',
      decimals: '',
      profileId: '',
      currencyType: '',
      currencyTypeName: '',
      sale: false,
      useSameReference: false,
      dtId: '',
      symbol: '',
      fromFunctionName: '',
      toFunctionName: '',
      fromDTName: '',
      ...record
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      fromFunctionId: yup.string().required(),
      fromDTId: yup.string().required(),
      toFunctionId: yup.string().required(),
      dtId: yup.string().required()
    }),
    onSubmit: async obj => {
      const fromFunctionId = formik.values.fromFunctionId
      const fromDTId = formik.values.fromDTId
      const toFunctionId = formik.values.toFunctionId

      await postRequest({
        extension: SystemRepository.DocumentTypeMap.set,
        record: JSON.stringify(obj)
      })

      toast.success(!fromFunctionId && !fromDTId && !toFunctionId ? platformLabels.Added : platformLabels.Edited)
      formik.setValues({
        ...obj,
        recordId: String(obj.fromFunctionId) + String(obj.fromDTId) + String(obj.toFunctionId)
      })
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (record && record.fromFunctionId && record.fromDTId && record.toFunctionId) {
        const res = await getRequest({
          extension: SystemRepository.DocumentTypeMap.get,
          parameters: `_fromFunctionId=${record.fromFunctionId}&_fromDTId=${record.fromDTId}&_toFunctionId=${record.toFunctionId}`
        })

        formik.setValues({
          ...res.record,
          recordId: String(res.record.fromFunctionId) + String(res.record.fromDTId) + String(res.record.toFunctionId)
        })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.DocumentTypeMaps} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.SYSTEM_FUNCTION}
                name='fromFunctionId'
                label={labels.fromFunction}
                valueField='key'
                displayField='value'
                readOnly={editMode}
                maxAccess={maxAccess}
                values={formik.values}
                onChange={(_, newValue) => {
                  if (newValue) {
                    formik && formik.setFieldValue('fromFunctionId', newValue?.key)
                    formik && formik.setFieldValue('fromFunctionName', newValue?.value)
                  } else {
                    formik && formik.setFieldValue('fromFunctionId', '')
                    formik && formik.setFieldValue('fromFunctionName', '')
                  }
                  formik && formik.setFieldValue('fromDTId', '')
                }}
                error={formik.touched.fromFunctionId && Boolean(formik.errors.fromFunctionId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={formik.values.fromFunctionId && SystemRepository.DocumentType.qry}
                name='fromDTId'
                label={labels.fromDocument}
                valueField='recordId'
                displayField='name'
                readOnly={editMode}
                values={formik.values}
                parameters={
                  formik.values.fromFunctionId &&
                  (formik.values.fromFunctionId
                    ? `_dgId=${editMode ? '0' : formik.values.fromFunctionId}&_startAt=${0}&_pageSize=${1000}`
                    : `_dgId=0&_startAt=${0}&_pageSize=${1000}`)
                }
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('fromDTId', newValue?.recordId)
                }}
                error={formik.touched.fromDTId && Boolean(formik.errors.fromDTId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.SYSTEM_FUNCTION}
                name='toFunctionId'
                label={labels.toFunction}
                readOnly={editMode}
                valueField='key'
                displayField='value'
                maxAccess={maxAccess}
                values={formik.values}
                onChange={(_, newValue) => {
                  if (newValue) {
                    formik && formik.setFieldValue('toFunctionId', newValue?.key)
                    formik && formik.setFieldValue('toFunctionName', newValue?.value)
                  } else {
                    formik && formik.setFieldValue('toFunctionId', '')
                    formik && formik.setFieldValue('toFunctionName', '')
                  }
                  formik && formik.setFieldValue('dtId', '')
                }}
                error={formik.touched.toFunctionId && Boolean(formik.errors.toFunctionId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={formik.values.toFunctionId && SystemRepository.DocumentType.qry}
                name='dtId'
                label={labels.toDocument}
                valueField='recordId'
                displayField='name'
                maxAccess={maxAccess}
                values={formik.values}
                parameters={
                  formik.values.toFunctionId &&
                  (formik.values.toFunctionId
                    ? `_dgId=${formik.values.toFunctionId}&_startAt=${0}&_pageSize=${1000}`
                    : `_dgId=0&_startAt=${0}&_pageSize=${1000}`)
                }
                onChange={(_, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='useSameReference'
                value={formik.values?.useSameReference}
                onChange={event => formik.setFieldValue('useSameReference', event.target.checked)}
                label={labels.useSameRef}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
