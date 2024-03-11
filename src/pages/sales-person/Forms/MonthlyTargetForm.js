import { useFormik } from 'formik'
import * as yup from 'yup'
import { useEffect, useState, useContext } from 'react'
import toast from 'react-hot-toast'

// ** Custom Imports
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
          month: '',
          amount: ''
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
    onSubmit: async obj => {
      // Create the resultObject
      const resultObject = {
        spId: recordId,
        items: obj.rows
      }

      /* const response = await postRequest({
        extension: SaleRepository.Target.set2,
        record: JSON.stringify(resultObject)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
      } else toast.success('Record Edited Successfully')

      invalidate()*/
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
    } else {
      formik.setFieldValue('targetAmount', '')
    }
  }

  const totalAmount = detailsFormik.values.rows.reduce((sumAmount, row) => {
    // Parse amount as a number
    const amountValue = parseFloat(row.amount.toString().replace(/,/g, '')) || 0

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
      name: 'amount',
      width: 300
    }
  ]

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          setIsLoading(true)
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

          /*          const amountRes = await getRequest({
            extension: SaleRepository.Target.qry,
            parameters: `_spId=${recordId}`
          })*/

          if (sortedList.length > 0) {
            const newRows = sortedList.map(monthObj => {
              // const correspondingAmount = amountRes.list.find(amountObj => amountObj.month === monthObj.month)

              return {
                spId: recordId,
                month: String(monthObj.value), // Convert to string
                amount: 0

                //correspondingAmount ? correspondingAmount.targetAmount : 0
              }
            })

            detailsFormik.setValues({ rows: newRows })
          }
        }
      } catch (error) {
        setErrorMessage(error)
      }
      setIsLoading(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId])

  return (
    <FormShell resourceId={ResourceIds.SalesPerson} form={formik} height={300} editMode={true} maxAccess={maxAccess}>
      <Grid container>
        <Grid item xs={12}>
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={9}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalYears.qry}
                name='fiscalYear'
                label={labels[10]}
                valueField='fiscalYear'
                displayField='fiscalYear'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('fiscalYear', newValue?.fiscalYear)
                  changeFiscal(newValue?.fiscalYear)
                }}
                error={formik.touched.fiscalYear && Boolean(formik.errors.fiscalYear)}
                helperText={formik.touched.fiscalYear && formik.errors.fiscalYear}
              />
            </Grid>
            <Grid
              item
              container
              alignItems='center'
              justifyContent='flex-start'
              sx={{ display: 'flex', justifyContent: 'flex-end', width: '170px' }}
            >
              <CustomTextField
                name='targetAmount'
                label={labels[9]}
                value={formik.values.targetAmount}
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
        <Grid item xs={12} sx={{ pt: 2 }}>
          <Box sx={{ width: '100%' }}>
            <InlineEditGrid
              gridValidation={detailsFormik}
              maxAccess={maxAccess}
              columns={columns}
              defaultRow={{
                spId: recordId,
                month: '',
                amount: ''
              }}
              scrollHeight={230}
              allowAddNewLine={false}
              allowDelete={false}
            />
          </Box>
        </Grid>
        <Grid item sx={{ pt: 3, display: 'flex', justifyContent: 'flex-end', marginLeft: '560px' }}>
          <CustomTextField
            name='balance'
            label={labels[14]}
            value={totalAmount - formik.values.targetAmount}
            maxAccess={maxAccess}
            readOnly={true}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('balance', '')}
            error={formik.touched.balance && Boolean(formik.errors.balance)}
            helperText={formik.touched.balance && formik.errors.balance}
            sx={{ width: '160px' }}
            numberField={true}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
