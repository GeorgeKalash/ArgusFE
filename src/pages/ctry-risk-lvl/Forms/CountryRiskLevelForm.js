import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'

export default function CountryRiskLevelForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: RemittanceSettingsRepository.CountryRisk.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId,
      countryId: null,
      riskLevel: null
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      countryId: yup.string().required(),
      riskLevel: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: RemittanceSettingsRepository.CountryRisk.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', obj?.countryId)
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: RemittanceSettingsRepository.CountryRisk.get,
          parameters: `_countryId=${recordId}`
        })

        formik.setValues({ ...res.record, recordId: res.record.countryId })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.CountryRiskLevel} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Country.qry}
                name='countryId'
                label={labels.country}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                displayFieldWidth={1}
                readOnly={editMode}
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
                endpointId={CurrencyTradingSettingsRepository.RiskLevel.qry}
                name='riskLevel'
                label={labels.riskLevel}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                required
                values={formik.values}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('riskLevel', newValue?.recordId || null)
                  }
                }}
                error={formik.touched.riskLevel && Boolean(formik.errors.riskLevel)}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
