// ** MUI Imports
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { SystemRepository } from 'src/repositories/SystemRepository'

export default function ExchangeTablesForm({ labels, maxAccess, recordId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    reference: '',
    name: '',
    currencyId: '',
    rateCalcMethod: '',
    rateAgainst: '',
    rateAgainstCurrencyId: ''
  })

  const { getRequest, postRequest } = useContext(RequestsContext)

  //const editMode = !!recordId

  const invalidate = useInvalidate({
    endpointId: MultiCurrencyRepository.ExchangeTable.page
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(' '),
      name: yup.string().required(' '),
      currencyId: yup.string().required(' '),
      rateCalcMethod: yup.string().required(' '),
      rateAgainst: yup.string().required(' '),
      rateAgainstCurrencyId: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: MultiCurrencyRepository.ExchangeTable.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
        setInitialData({
          ...obj, // Spread the existing properties
          recordId: response.recordId // Update only the recordId field
        })
      } else toast.success('Record Edited Successfully')
      setEditMode(true)

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          setIsLoading(true)

          const res = await getRequest({
            extension: MultiCurrencyRepository.ExchangeTable.get,
            parameters: `_recordId=${recordId}`
          })

          setInitialData(res.record)
        }
      } catch (exception) {
        setErrorMessage(error)
      }
      setIsLoading(false)
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.ExchangeTables}
      form={formik}
      height={300}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={labels.reference}
            value={formik.values.reference}
            required
            maxAccess={maxAccess}
            maxLength='10'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('reference', '')}
            error={formik.touched.reference && Boolean(formik.errors.reference)}

            // helperText={formik.touched.reference && formik.errors.reference}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={labels.name}
            value={formik.values.name}
            required
            maxAccess={maxAccess}
            maxLength='50'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('name', '')}
            error={formik.touched.name && Boolean(formik.errors.name)}

            // helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={SystemRepository.Currency.qry}
            name='currencyId'
            label={labels.currencyId}
            valueField='recordId'
            displayField='name'
            values={formik.values}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('currencyId', newValue?.recordId)
            }}
            error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}

            // helperText={formik.touched.currencyId && formik.errors.currencyId}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            datasetId={DataSets.MC_RATE_CALC_METHOD}
            name='rateCalcMethod'
            label={labels.rateCalcMethod}
            valueField='key'
            displayField='value'
            values={formik.values}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('rateCalcMethod', newValue?.key)
            }}
            error={formik.touched.rateCalcMethod && Boolean(formik.errors.rateCalcMethod)}

            // helperText={formik.touched.rateCalcMethod && formik.errors.rateCalcMethod}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            datasetId={DataSets.MC_RATE_AGAINST}
            name='rateAgainst'
            label={labels.rateAgainst}
            valueField='key'
            displayField='value'
            values={formik.values}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('rateAgainst', newValue?.key)
            }}
            error={formik.touched.rateAgainst && Boolean(formik.errors.rateAgainst)}

            // helperText={formik.touched.rateAgainst && formik.errors.rateAgainst}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={SystemRepository.Currency.qry}
            name='rateAgainstCurrencyId'
            label={labels.rateAgainstCurrencyId}
            valueField='recordId'
            displayField='name'
            values={formik.values}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('rateAgainstCurrencyId', newValue?.recordId)
            }}
            error={formik.touched.rateAgainstCurrencyId && Boolean(formik.errors.rateAgainstCurrencyId)}

            // helperText={formik.touched.rateAgainstCurrencyId && formik.errors.rateAgainstCurrencyId}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
