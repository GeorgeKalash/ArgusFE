import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'

import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function ExRatesForm({ labels, recordId, maxAccess }) {
  const [editMode, setEditMode] = useState(!!recordId)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: MultiCurrencyRepository.ExchangeRates.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      exId: null,
      seqNo: 0,
      rate: '',
      dayId: ''
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,

    onSubmit: async obj => {
      if (obj.dayId) {
        const date = new Date(obj.dayId)
        const formattedDate = date.toISOString().replace(/-/g, '').substring(0, 8)
        obj.dayId = formattedDate
      }

      const recordId = obj.recordId

      const response = await postRequest({
        extension: MultiCurrencyRepository.ExchangeRates.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
      } else {
        formik.setValues({ ...obj, seqNo: response.seqNo })
        toast.success('Record Edited Successfully')
      }
      setEditMode(true)

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        try {
          const res = await getRequest({
            extension: MultiCurrencyRepository.ExchangeRates.get,
            parameters: `_recordId=${recordId}`
          })

          if (res && res.record) {
            console.log('resssss', res.record)
            const { exId, dayId, seqNo } = res.record

            const seqNoStr = String(seqNo)

            const newRecordId = `${exId}${dayId}${seqNoStr}`

            formik.setValues({ ...res.record, recordId: newRecordId })
          }
        } catch (error) {
          console.error('Error fetching data:', error)
        }
      }
    })()
  }, [recordId, getRequest, formik.setValues])

  return (
    <FormShell
      resourceId={ResourceIds.ExchangeRates}
      form={formik}
      height={400}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={MultiCurrencyRepository.ExchangeTable.qry}
            name='exId'
            label={labels.exTable}
            valueField='recordId'
            displayField={['reference', 'name']}
            columnsInDropDown={[
              { key: 'reference', value: ' Ref' },
              { key: 'name', value: 'Name' }
            ]}
            values={formik.values}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik && formik.setFieldValue('exId', newValue?.recordId)
            }}
            error={formik.touched.exId && Boolean(formik.errors.exId)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomDatePicker
            name='dayId'
            label={labels.date}
            onChange={formik.setFieldValue}
            value={formik.values.dayId}
            maxAccess={maxAccess}
            required
            error={formik.touched.dayId && Boolean(formik.errors.dayId)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomNumberField
            name='rate'
            label={labels.rate}
            value={formik.values?.rate}
            required
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('rate', '')}
            maxAccess={maxAccess}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
