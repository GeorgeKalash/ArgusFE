import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'

export default function ExRatesForm({ labels, recordId, maxAccess, record, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: MultiCurrencyRepository.ExchangeRates.page
  })

  const formatDate = dateStr => {
    return `${dateStr.substring(0, 4)}/${dateStr.substring(4, 6)}/${dateStr.substring(6, 8)}`
  }

  const formatDateToYYYYMMDD = dateValue => {
    const date = new Date(dateValue)

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}${month}${day}`
  }

  const { formik } = useForm({
    initialValues: {
      recordId: recordId,
      exId: '',
      seqNo: 0,
      rate: '',
      dayId: new Date()
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      exId: yup.string().required(),
      dayId: yup.string().required(),
      rate: yup.string().required()
    }),
    onSubmit: async obj => {
      const exId = formik.values.exId
      const dayId = formik.values.dayId
      const seqNo = formik.values.seqNo

      try {
        await postRequest({
          extension: MultiCurrencyRepository.ExchangeRates.set,
          record: JSON.stringify({
            ...obj,
            dayId: formatDateToYYYYMMDD(obj.dayId)
          })
        })

        if (!exId && !dayId && !seqNo) {
          toast.success(platformLabels.Added)
        } else toast.success(platformLabels.Edited)

        formik.setFieldValue(
          'recordId',

          String(obj.exId) + String(obj.dayId) + String(obj.seqNo)
        )
        window.close()
        invalidate()
      } catch (error) {}
    }
  })

  const editMode = !!formik.values.recordId || !!recordId

  useEffect(() => {
    if (editMode && record) {
      ;(async function fetchRecordDetails() {
        try {
          const res = await getRequest({
            extension: MultiCurrencyRepository.ExchangeRates.get,
            parameters: `_exId=${record.exId}&_dayId=${record.dayId}&_seqNo=${record.seqNo}`
          })

          if (res && res.record) {
            const newRecordId = `${res.record.exId}${res.record.dayId}${String(res.record.seqNo)}`
            const formattedDate = formatDate(res.record.dayId)
            const newDayId = new Date(formattedDate)

            formik.setValues({
              ...res.record,
              recordId: newRecordId,
              dayId: newDayId
            })
          }
        } catch (error) {}
      })()
    }
  }, [])

  useEffect(() => {
    ;(async function () {
      try {
        if (record && record.exId && record.dayId && record.seqNo && recordId) {
          const res = await getRequest({
            extension: MultiCurrencyRepository.ExchangeRates.get,
            parameters: `_exId=${record.exId}&_dayId=${record.dayId}&_seqNo=${record.seqNo}`
          })
          const formattedDate = formatDate(res.record.dayId)
          const newDayId = new Date(formattedDate)

          formik.setValues({
            ...res.record,
            dayId: newDayId,
            recordId: String(res.record.exId) + String(res.record.dayId) + String(res.record.seqNo)
          })
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.ExchangeRates} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={MultiCurrencyRepository.ExchangeTable.qry}
                name='exId'
                label={labels.exTable}
                readOnly={editMode}
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
                error={Boolean(formik.errors.exId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='dayId'
                readOnly={editMode}
                label={labels.stDate}
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
                decimalScale={7}
                value={formik.values?.rate}
                required
                maxLength='18'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('rate', '')}
                maxAccess={maxAccess}
                error={formik.touched.rate && Boolean(formik.errors.rate)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
