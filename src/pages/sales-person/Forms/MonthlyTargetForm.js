import { useFormik } from 'formik'
import * as yup from 'yup'
import { useEffect, useState, useContext } from 'react'
import toast from 'react-hot-toast'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import { SaleRepository } from 'src/repositories/SaleRepository'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Box, Grid } from '@mui/material'
import { useInvalidate } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { CommonContext } from 'src/providers/CommonContext'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { AuthContext } from 'src/providers/AuthContext'
import { getFormattedNumber } from 'src/lib/numberField-helper'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

export default function MonthlyTargetForm({ labels, maxAccess, recordId, setErrorMessage }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { user, setUser } = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(false)

  const invalidate = useInvalidate({
    endpointId: SaleRepository.Target.qry
  })

  const detailsFormik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      rows: [
        {
          spId: recordId,
          monthId: '',
          month: '',
          targetAmount: '',
          fiscalYear: ''
        }
      ]
    }
  })

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      recordId: recordId,
      fiscalYear: '',
      targetAmount: '',
      balance: ''
    },
    validationSchema: yup.object({
      fiscalYear: yup.string().required('This field is required')
    }),
    onSubmit: async obj => {
      const updatedRows = detailsFormik.values.rows.map(monthDetail => {
        return {
          ...monthDetail,
          month: parseInt(monthDetail.monthId),
          fiscalYear: formik.values.fiscalYear
        }
      })

      const updatedRowsWithoutMonthId = updatedRows.map(monthDetail => {
        const { monthId, ...rest } = monthDetail

        return rest
      })

      // Create the resultObject
      const resultObject = {
        spId: recordId,
        fiscalYear: obj.fiscalYear,
        items: updatedRowsWithoutMonthId
      }

      const response = await postRequest({
        extension: SaleRepository.TargetMonth.set2,
        record: JSON.stringify(resultObject)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
      } else toast.success('Record Edited Successfully')

      invalidate()
    }
  })

  const changeFiscal = async selectedFiscal => {
    if (selectedFiscal) {
      var fiscalYear = selectedFiscal
      var spId = recordId
      var parameters = `_fiscalYear=${fiscalYear}&_spId=${spId}`

      const res = await getRequest({
        extension: SaleRepository.Target.get,
        parameters: parameters
      })
      if (res.record?.targetAmount) {
        formik.setFieldValue('targetAmount', res.record.targetAmount)
      } else {
        formik.setFieldValue('targetAmount', '')
      }
      var _language = user.languageId
      var _dataset = DataSets.MONTHS
      var parameters = `_dataset=${_dataset}&_language=${_language}`

      const monthRes = await getRequest({
        extension: SystemRepository.KeyValueStore,
        parameters: parameters
      })

      // Assuming sortedList is an array of objects
      const sortedList = monthRes.list.sort((a, b) => {
        const keyA = parseInt(a.key, 10)
        const keyB = parseInt(b.key, 10)

        return keyA - keyB
      })
      if (sortedList.length > 0) {
        const amountRes = await getRequest({
          extension: SaleRepository.TargetMonth.qry,
          parameters: `_spId=${recordId}&_fiscalYear=${fiscalYear}`
        })

        const newRows = sortedList.map(monthObj => {
          const correspondingAmount = amountRes.list.find(amountObj => amountObj.month === parseInt(monthObj.key))

          return {
            spId: recordId,
            monthId: monthObj.key,
            month: String(monthObj.value), // Convert to string
            targetAmount: correspondingAmount ? correspondingAmount.targetAmount : 0
          }
        })

        detailsFormik.setValues({ rows: newRows })
      }
    } else {
      formik.setFieldValue('targetAmount', '')
      detailsFormik.resetForm()
    }
  }

  const totalAmount = detailsFormik.values.rows.reduce((sumAmount, row) => {
    // Parse amount as a number
    const amountValue = parseFloat(row.targetAmount.toString().replace(/,/g, '')) || 0

    return sumAmount + amountValue
  }, 0)

  const columns = [
    {
      field: 'textfield',
      header: labels[12],
      name: 'month',
      mandatory: true,
      readOnly: true,
      width: 300
    },
    {
      field: 'numberfield',
      header: labels[13],
      name: 'targetAmount',
      width: 300
    }
  ]

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          setIsLoading(true)
        }
      } catch (error) {
        setErrorMessage(error)
      }
      setIsLoading(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId])

  return (
    <FormShell resourceId={ResourceIds.SalesPerson} form={formik} editMode={true} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={9}>
                  <ResourceComboBox
                    endpointId={SystemRepository.FiscalYears.qry}
                    name='fiscalYear'
                    label={labels[10]}
                    valueField='fiscalYear'
                    displayField='fiscalYear'
                    values={formik.values}
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik && formik.setFieldValue('fiscalYear', newValue?.fiscalYear)
                      changeFiscal(newValue?.fiscalYear)
                    }}
                    error={formik.touched.fiscalYear && Boolean(formik.errors.fiscalYear)}
                    helperText={formik.touched.fiscalYear && formik.errors.fiscalYear}
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomTextField
                    name='targetAmount'
                    label={labels[9]}
                    value={getFormattedNumber(formik.values.targetAmount)}
                    maxAccess={maxAccess}
                    readOnly={true}
                    numberField={true}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('targetAmount', '')}
                    error={formik.touched.targetAmount && Boolean(formik.errors.targetAmount)}
                    helperText={formik.touched.targetAmount && formik.errors.targetAmount}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Box>
                <InlineEditGrid
                  gridValidation={detailsFormik}
                  maxAccess={maxAccess}
                  columns={columns}
                  defaultRow={{
                    spId: recordId,
                    month: '',
                    targetAmount: ''
                  }}
                  allowAddNewLine={false}
                  allowDelete={false}
                />
              </Box>
            </Grid>
              <Grid item xs={9}></Grid>
              <Grid item xs={3}>
                <CustomTextField
                  name='balance'
                  label={labels[14]}
                  value={getFormattedNumber(totalAmount - formik.values.targetAmount)}
                  maxAccess={maxAccess}
                  readOnly={true}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('balance', '')}
                  error={formik.touched.balance && Boolean(formik.errors.balance)}
                  helperText={formik.touched.balance && formik.errors.balance}
                  numberField={true}
                />
              </Grid>
            </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
