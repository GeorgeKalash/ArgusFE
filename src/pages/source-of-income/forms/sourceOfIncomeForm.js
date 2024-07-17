import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'

export default function SourceOfIncomeForm({ labels, maxAccess, recordId, setStore }) {
  const [editMode, setEditMode] = useState(!!recordId)
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: RemittanceSettingsRepository.SourceOfIncome.page
  })

  const { formik } = useForm({
    initialValues: { recordId: null, name: '', reference: '', flName: '', sitId: '' },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(' '),
      reference: yup.string().required(' '),
      sitId: yup.string().required(' '),
      flName: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: RemittanceSettingsRepository.SourceOfIncome.set,
        record: JSON.stringify(obj)
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
      try {
        if (recordId) {
          const res = await getRequest({
            extension: RemittanceSettingsRepository.SourceOfIncome.get,
            parameters: `_recordId=${recordId}`
          })
          setStore({
            recordId: res.record.recordId,
            name: res.record.name
          })
          formik.setValues(res.record)
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.SourceOfIncome} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={labels.name}
            value={formik.values.name}
            required
            maxAccess={maxAccess}
            maxLength='30'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('name', '')}
            error={formik.touched.name && Boolean(formik.errors.name)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={labels.reference}
            value={formik.values.reference}
            required
            rows={2}
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('reference', '')}
            error={formik.touched.reference && Boolean(formik.errors.reference)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='flName'
            label={labels.flName}
            value={formik.values.flName}
            rows={2}
            required
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('flName', '')}
            error={formik.touched.flName && Boolean(formik.errors.flName)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={RemittanceSettingsRepository.SourceOfIncomeType.qry}
            name='sitId'
            label={labels.incomeType}
            valueField='recordId'
            displayField={['reference', 'name']}
            required
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            values={formik.values}
            onChange={(event, newValue) => {
              formik.setFieldValue('sitId', newValue ? newValue.recordId : '')
              formik.setFieldValue('sitRef', newValue ? newValue.reference : '')
              formik.setFieldValue('sitName', newValue ? newValue.name : '')
            }}
            error={formik.touched.incomeType && Boolean(formik.errors.incomeType)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
