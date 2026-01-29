import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import * as yup from 'yup'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'

export default function GeneralForm({ labels, maxAccess, store, setStore }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: SaleRepository.SalesPerson.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      spRef: '',
      name: '',
      cellPhone: '',
      commissionPct: null,
      plantId: null,
      sptId: null,
      targetType: null,
      isInactive: false
    },
    maxAccess,
    validationSchema: yup.object({
      spRef: yup.string().required(),
      name: yup.string().required(),
      commissionPct: yup
        .number()
        .nullable()
        .min(0.01, ' must be greater than 0')
        .max(100, ' must be less than or equal to 100')
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: SaleRepository.SalesPerson.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        setStore({ recordId: response.recordId })
        formik.setFieldValue('recordId', response.recordId)
      }
      toast.success(!!obj.recordId ? platformLabels.Edited : platformLabels.Added)
      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: SaleRepository.SalesPerson.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.SalesPerson}
      form={formik}
      maxAccess={maxAccess}
      actions={actions}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='spRef'
                label={labels.reference}
                value={formik.values.spRef}
                required
                maxLength='10'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('spRef', '')}
                error={formik.touched.spRef && Boolean(formik.errors.spRef)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='cellPhone'
                label={labels.phone}
                value={formik.values.cellPhone}
                maxLength='15'
                phone={true}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('cellPhone', null)}
                error={formik.touched.cellPhone && Boolean(formik.errors.cellPhone)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='commissionPct'
                label={labels.commissionPct}
                value={formik.values.commissionPct}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('commissionPct', null)}
                error={formik.touched.commissionPct && Boolean(formik.errors.commissionPct)}
                allowNegative={false}
                maxLength={5}
                decimalScale={2}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue?.recordId || null)
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SaleRepository.SalesTeam.qry}
                name='sptId'
                label={labels.team}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('sptId', newValue?.recordId || null)
                }}
                error={formik.touched.sptId && Boolean(formik.errors.sptId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SaleRepository.CommissionSchedule.qry}
                name='commissionScheduleId'
                label={labels.commissionSchedule}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('commissionScheduleId', newValue?.recordId || null)
                }}
                error={formik.touched.commissionScheduleId && Boolean(formik.errors.commissionScheduleId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.TARGET_TYPE}
                name='targetType'
                label={labels.targetType}
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('targetType', newValue?.key || null)
                }}
                error={formik.touched.targetType && Boolean(formik.errors.targetType)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='isInactive'
                value={formik.values?.isInactive}
                onChange={event => formik.setFieldValue('isInactive', event.target.checked)}
                label={labels.isInactive}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
