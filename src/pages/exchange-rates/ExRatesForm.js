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
  const [editMode, setEditMode] = useState(!!recordId)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: MultiCurrencyRepository.ExchangeRates.qry
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

    // enab leReinitialize: true,
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
        console.log('Original Date:', obj.dayId, 'Formatted Date:', date)
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
      window.close()
      setEditMode(true)

      invalidate()
    }
  })

  useEffect(() => {
    if (editMode) {
      ;(async function () {
        try {
          const res = await getRequest({
            extension: MultiCurrencyRepository.ExchangeRates.get,
            parameters: `_exId=${record.exId}&_dayId=${record.dayId}&_seqNo=${record.seqNo}`
          })

          if (res && res.record) {
            const { exId, dayId, seqNo } = res.record
            const seqNoStr = String(seqNo)

            const newRecordId = `${exId}${dayId}${seqNoStr}`
            setEditMode(true)
            formik.setValues({ ...res.record, recordId: newRecordId, dayId: new Date(formatDate(record.dayId)) })
          }
        } catch (error) {
          console.error('Error fetching data:', error)
        }
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
                onClear={() => formik.setFieldValue('exId', '')}
                error={formik.touched.exId && Boolean(formik.errors.exId)}
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
