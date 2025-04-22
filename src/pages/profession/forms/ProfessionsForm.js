import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'

export default function ProfessionsForm({ labels, maxAccess, recordId, setStore }) {
  const [editMode, setEditMode] = useState(!!recordId)

  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: RemittanceSettingsRepository.Profession.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      reference: '',
      name: '',
      flName: '',
      riskLevelId: '',
      diplomatStatus: '',
      sraId: '',
      pfgId: '',
      approvalLevel: '',
      isInactive: false
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object().shape({
      name: yup.string().required(),
      reference: yup.string().required(),
      flName: yup.string().required(),
      sraId: yup.string().required(),
      diplomatStatus: yup.string().required()
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId
      const data = { ...obj, monthlyIncome: obj.monthlyIncome }

      const response = await postRequest({
        extension: RemittanceSettingsRepository.Profession.set,
        record: JSON.stringify(data)
      })

      if (!recordId) {
        setStore({
          recordId: response.recordId,
          name: obj.name
        })
        toast.success(platformLabels.Added)

        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      } else toast.success(platformLabels.Edited)

      setEditMode(true)
      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: RemittanceSettingsRepository.Profession.get,
          parameters: `_recordId=${recordId}`
        })
        setStore({
          recordId: res.record.recordId,
          name: res.record.name
        })
        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Profession} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                onChange={formik.handleChange}
                maxLength='10'
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxLength='50'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='flName'
                label={labels.flName}
                value={formik.values.flName}
                required
                maxLength='50'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('flName', '')}
                error={formik.touched.flName && Boolean(formik.errors.flName)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RemittanceSettingsRepository.SalaryRange.qry}
                name='sraId'
                label={labels.salaryRange}
                valueField='recordId'
                required
                displayField={['min', '->', 'max']}
                columnsInDropDown={[
                  { key: 'min', value: 'MIN' },
                  { key: 'max', value: 'MAX' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('sraId', newValue ? newValue?.recordId : '')
                }}
                error={formik.touched.sraId && Boolean(formik.errors.sraId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={CurrencyTradingSettingsRepository.RiskLevel.qry}
                name='riskLevelId'
                label={labels.riskLevel}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('riskLevelId', newValue ? newValue?.recordId : '')
                }}
                error={formik.touched.riskLevelId && Boolean(formik.errors.riskLevelId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RemittanceSettingsRepository.ProfessionGroups.qry}
                name='pfgId'
                label={labels.professionGroups}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('pfgId', newValue ? newValue?.recordId : '')
                }}
                error={formik.touched.pfgId && Boolean(formik.errors.pfgId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.DIPLOMAT_STATUS}
                name='diplomatStatus'
                label={labels.diplomatStatus}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('diplomatStatus', newValue?.key)
                }}
                error={formik.touched.diplomatStatus && Boolean(formik.errors.diplomatStatus)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.APPROVAL_LEVEL}
                name='approvalLevel'
                label={labels.approvalLevel}
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('approvalLevel', newValue?.key)
                }}
                error={formik.touched.approvalLevel && Boolean(formik.errors.approvalLevel)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='isInactive'
                value={formik.values?.isInactive}
                onChange={event => formik.setFieldValue('isInactive', event.target.checked)}
                label={labels.isInActive}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
