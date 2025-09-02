import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { SaleRepository } from 'src/repositories/SaleRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DataSets } from 'src/resources/DataSets'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'

export default function ScheduleForm({ labels, maxAccess, store, setStore }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: SaleRepository.SalesPerson.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId,
      spRef: '',
      name: '',
      cellPhone: '',
      commissionPct: '',
      plantId: null,
      sptId: null,
      targetType: ''
    },
    maxAccess,
    onSubmit: async obj => {
      const response = await postRequest({
        extension: SaleRepository.SalesPerson.set,
        record: JSON.stringify(obj)
      })

      if (!!recordId) {
        setStore(prevStore => ({
          ...prevStore,
          recordId: response.recordId
        }))
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      }
      toast.success(!!recordId ? platformLabels.Edited : platformLabels.Added)
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

        formik.setValues({ ...res.record })
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
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='spRef'
                label={labels.reference}
                value={formik.values.spRef}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('spRef', '')}
                error={formik.touched.spRef && Boolean(formik.errors.spRef)}
                helperText={formik.touched.spRef && formik.errors.spRef}
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
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='cellPhone'
                label={labels.phone}
                value={formik.values.cellPhone}
                maxAccess={maxAccess}
                maxLength='15'
                onChange={e => {
                  const inputValue = e.target.value
                  if (/^[0-9]*$/.test(inputValue)) {
                    formik.setFieldValue('cellPhone', inputValue)
                  }
                }}
                onClear={() => formik.setFieldValue('cellPhone', '')}
                error={formik.touched.cellPhone && Boolean(formik.errors.cellPhone)}
                helperText={formik.touched.cellPhone && formik.errors.cellPhone}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='commissionPct'
                label={labels.commissionPct}
                value={formik.values.commissionPct}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('commissionPct', '')}
                error={formik.touched.commissionPct && Boolean(formik.errors.commissionPct)}
                helperText={formik.touched.commissionPct && formik.errors.commissionPct}
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
                columnsInDropDown={[{ key: 'name', value: 'Name' }]}
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
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
