import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
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

export default function ExRatesForm({ labels, recordId, maxAccess, record, window }) {
  const [editMode, setEditMode] = useState(!!recordId || !!record)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: MultiCurrencyRepository.ExchangeRates.page
  })

  const formatDate = dateStr => {
    return `${dateStr.substring(0, 4)}/${dateStr.substring(4, 6)}/${dateStr.substring(6, 8)}`
  }

  const { formik } = useForm({
    initialValues: {
      recordId: editMode ? recordId : '',
      exId: record?.exId || '',
      seqNo: record?.seqNo || 0,
      rate: record?.rate || '',
      dayId: record?.dayId ? new Date(formatDate(record.dayId)) : new Date()
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      exId: yup.string().required(' '),
      dayId: yup.string().required(' '),
      rate: yup.string().required(' ')
    }),

    onSubmit: async obj => {
      const moment = require('moment')

      let dayId = ''
      if (obj.dayId) {
        const date = moment(obj.dayId).format('YYYYMMDD')
        dayId = date
      }

      const { ...dataToSend } = obj

      const response = await postRequest({
        extension: MultiCurrencyRepository.ExchangeRates.set,
        record: JSON.stringify({ ...dataToSend, dayId })
      })

      const newRecordId = `${dataToSend.exId}${dayId}${dataToSend.seqNo}`
      if (!editMode) {
        toast.success('Record Added Successfully')
        formik.setValues({
          ...dataToSend,
          seqNo: response.seqNo,
          recordId: newRecordId
        })
      } else {
        toast.success('Record Edited Successfully')
        formik.setValues({
          ...dataToSend,
          seqNo: response.seqNo,
          recordId
        })
      }

      setEditMode(true)
      window.close()
      invalidate()
    }
  })

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
                decimalScale={5}
                value={formik.values?.rate}
                required
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
