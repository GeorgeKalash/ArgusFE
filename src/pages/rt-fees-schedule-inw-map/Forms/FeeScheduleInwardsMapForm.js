import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { DataSets } from 'src/resources/DataSets'
import { ControlContext } from 'src/providers/ControlContext'

export default function FeeScheduleInwardsMapForm({ labels, maxAccess, recordId, record }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.FeeScheduleInwards.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId,
      corId: '',
      dispersalMode: '',
      scheduleId: ''
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      corId: yup.string().required(),
      scheduleId: yup.string().required(),
      dispersalMode: yup.string().required()
    }),
    onSubmit: async obj => {
      const corId = formik.values.corId
      const dispersalMode = formik.values.dispersalMode

      await postRequest({
        extension: RemittanceOutwardsRepository.FeeScheduleInwards.set,
        record: JSON.stringify(obj)
      })

      if (!corId && !dispersalMode) {
        toast.success(platformLabels.Added)
      } else toast.success(platformLabels.Edited)

      formik.setFieldValue(
        'recordId',
        String(obj.corId) + String(obj.dispersalMode)
      )

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      try {
        if (record && record.corId && record.scheduleId && recordId) {
          const res = await getRequest({
            extension: RemittanceOutwardsRepository.FeeScheduleInwards.get,
            parameters: `_corId=${record.corId}&_dispersalMode=${record.dispersalMode}`
          })

          formik.setValues({
            ...res.record,

            recordId:
              String(res.record.corId) +
              String(res.record.dispersalMode) +
              String(res.record.functionId)
          })
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.FeeScheduleInwardsMap} form={formik} maxAccess={maxAccess} editMode={editMode}>
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
