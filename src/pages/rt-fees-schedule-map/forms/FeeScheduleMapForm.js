import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { DataSets } from 'src/resources/DataSets'
import { ControlContext } from 'src/providers/ControlContext'

export default function FeeScheduleMapForm({ labels, maxAccess, recordId, record }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.FeeScheduleOutwards.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      corId: '',
      currencyId: '',
      countryId: '',
      dispersalMode: '',
      scheduleId: ''
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      corId: yup.string().required(),
      currencyId: yup.string().required(),
      scheduleId: yup.string().required(),
      dispersalMode: yup.string().required(),
      countryId: yup.string().required()
    }),

    onSubmit: async obj => {
      const currencyId = formik.values.currencyId
      const corId = formik.values.corId
      const dispersalMode = formik.values.dispersalMode
      const countryId = formik.values.countryId

      await postRequest({
        extension: RemittanceOutwardsRepository.FeeScheduleOutwards.set,
        record: JSON.stringify(obj)
      })

      if (!currencyId && !corId && !dispersalMode && !countryId) {
        toast.success(platformLabels.Added)
      } else toast.success(platformLabels.Edited)

      formik.setFieldValue(
        'recordId',

        String(obj.corId) + String(obj.currencyId) + String(obj.countryId) + String(obj.dispersalMode)
      )

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId || !!recordId

  useEffect(() => {
    ;(async function () {
      try {
        if (record && record.currencyId && record.corId && record.scheduleId && record.countryId && recordId) {
          const res = await getRequest({
            extension: RemittanceOutwardsRepository.FeeScheduleOutwards.get,
            parameters: `_currencyId=${record.currencyId}&_corId=${record.corId}&_dispersalMode=${record.dispersalMode}&_countryId=${record.countryId}`
          })

          formik.setValues({
            ...res.record,

            recordId:
              String(res.record.corId) +
              String(res.record.currencyId) +
              String(res.record.countryId) +
              String(res.record.dispersalMode)
          })
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.FeeScheduleMap} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
                valueField='reference'
                displayField='name'
                name='corId'
                readOnly={editMode}
                label={labels.cor}
                form={formik}
                required
                displayFieldWidth={2}
                valueShow='corRef'
                secondValueShow='corName'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('corId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('corName', newValue ? newValue.name : '')
                  formik.setFieldValue('corRef', newValue ? newValue.reference : '')
                }}
                error={formik.touched.corId && Boolean(formik.errors.corId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Country.qry}
                name='countryId'
                readOnly={editMode}
                label={labels.country}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('countryId', newValue ? newValue.recordId : '')
                }}
                error={formik.touched.countryId && Boolean(formik.errors.countryId)}
                maxAccess={maxAccess}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                readOnly={editMode}
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.recordId || null)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                name='dispersalMode'
                label={labels.dispersalMode}
                datasetId={DataSets.RT_Dispersal_Type}
                valueField='key'
                readOnly={editMode}
                displayField='value'
                values={formik.values}
                required
                onChange={(event, newValue) => {
                  formik.setFieldValue('dispersalMode', newValue?.key)
                }}
                error={formik.touched.dispersalMode && Boolean(formik.errors.dispersalMode)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RemittanceOutwardsRepository.FeeSchedule.qry}
                parameters='_startAt=0&_pageSize=50&filter='
                name='scheduleId'
                label={labels.schedule}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                readOnly={false}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('scheduleId', newValue?.recordId || null)
                }}
                error={formik.touched.scheduleId && Boolean(formik.errors.scheduleId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
