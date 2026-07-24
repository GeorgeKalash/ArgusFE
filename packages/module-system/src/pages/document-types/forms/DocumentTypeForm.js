import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { GeneralLedgerRepository } from '@argus/repositories/src/repositories/GeneralLedgerRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

export default function DocumentTypeForm({ labels, recordId, maxAccess }) {
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.DocumentType.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      reference: '',
      dgId: null,
      ilId: null,
      activeStatus: null,
      nraId: null,
      defaultPrintTemplateLayoutId: null
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required(),
      dgId: yup.number().required(),
      activeStatus: yup.number().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: SystemRepository.DocumentType.set,
        record: JSON.stringify(obj)
      })

      !obj.recordId &&
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: SystemRepository.DocumentType.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.DocumentTypes} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
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
                maxLength={10}
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
                onChange={(_, newValue) => {
                  formik.setFieldValue('dgId', newValue?.key || null)
                }}
                error={formik.touched.dgId && Boolean(formik.errors.dgId)}
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
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('ilId', newValue?.recordId || null)
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
                onChange={(_, newValue) => {
                  formik.setFieldValue('activeStatus', newValue?.key || null)
                }}
                error={formik.touched.activeStatus && Boolean(formik.errors.activeStatus)}
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
                displayFieldWidth={2}
                firstValue={formik.values.nraRef}
                secondValue={formik.values.nraDescription}
                onChange={(_, newValue) => {
                    formik.setFieldValue('nraId', newValue?.recordId || null)
                    formik.setFieldValue('nraRef', newValue?.reference || "")
                    formik.setFieldValue('nraDescription', newValue?.description || "")
                }}
                errorCheck={'nraId'}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                  name='defaultPrintTemplateLayoutId'
                  label={labels.defaultPrintTemplateLayoutId}
                  value={formik.values.defaultPrintTemplateLayoutId}
                  onChange={formik.handleChange}
                  maxLength='3'
                  decimalScale={0}
                  allowNegative={false}
                  onClear={() => formik.setFieldValue('defaultPrintTemplateLayoutId', null)}
                  error={formik.touched.defaultPrintTemplateLayoutId && Boolean(formik.errors.defaultPrintTemplateLayoutId)}
                  maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
