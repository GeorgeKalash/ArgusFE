// ** MUI Imports
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox, RadioGroup, Radio } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useError } from 'src/error'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { CTTRXrepository } from 'src/repositories/CTTRXRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'

export default function CreditOrderForm({ labels, maxAccess, recordId, setErrorMessage, expanded, plantId }) {
  const { height } = useWindowDimensions()
  const [isLoading, setIsLoading] = useState(false)
  const [currencyStore, setCurrencyStore] = useState([])
  const [rateType, setRateType] = useState(null)
  const [editMode, setEditMode] = useState(!!recordId)
  const { stack: stackError } = useError()
  const [toCurrency, setToCurrency] = useState(null)

  const [initialValues, setInitialData] = useState({
    recordId: recordId || null,
    currencyId: '',
    date: new Date(),
    deliveryDate: new Date(),
    reference: '',
    plantId: parseInt(plantId),
    corId: '',
    corRef: '',
    corName: '',
    wip: '',
    status: '',
    releaseStatus: '',
    notes: ''
  })
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: CTTRXrepository.CreditOrder.qry
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required('This field is required'),
      plantId: yup.string().required('This field is required'),
      corId: yup.string().required('This field is required')
    }),
    onSubmit: async obj => {
      try {
        const copy = { ...obj }
        delete copy.rows
        copy.date = formatDateToApi(copy.date)
        copy.deliveryDate = formatDateToApi(copy.deliveryDate)

        // Default values for properties if they are empty
        copy.wip = copy.wip === '' ? 1 : copy.wip
        copy.status = copy.status === '' ? 1 : copy.status
        copy.releaseStatus = copy.releaseStatus === '' ? 1 : copy.releaseStatus

        copy.currencyId = 2

        const updatedRows = detailsFormik.values.rows.map((orderDetail, index) => {
          const seqNo = index + 1 // Adding 1 to make it 1-based index

          return {
            ...orderDetail,
            seqNo: seqNo,
            orderId: orderDetail.orderId || 0
          }
        })

        console.log('updatedRows 2 ', updatedRows)

        if (updatedRows.length == 1 && updatedRows[0].currencyId == '') {
          throw new Error('Grid not filled. Please fill the grid before saving.')
        }

        const resultObject = {
          header: copy,
          items: updatedRows
        }

        const res = await postRequest({
          extension: CTTRXrepository.CreditOrder.set,
          record: JSON.stringify(resultObject)
        })

        if (res.recordId) {
          toast.success('Record Updated Successfully')
          formik.setFieldValue('recordId', res.recordId)
          invalidate()
          setEditMode(true)
          invalidate()
        }
      } catch (error) {
        setErrorMessage(error)
      }
    }
  })

  const detailsFormik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      rows: [
        {
          orderId: '',
          seqNo: '',
          currencyId: '',
          qty: '',
          rateCalcMethod: '',
          exRate: '',
          minRate: '',
          maxRate: '',
          baseAmount: '',
          amount: '',
          notes: '',

          exRate1: '', //currency to local
          exRate2: '', //local to correspondent
          rateCalcMethod1: '',
          rateCalcMethod2: ''
        }
      ]
    },
    validationSchema: yup.object({
      rows: yup.array().of(
        yup.object({
          currencyId: yup.string().required('This field is required'),
          qty: yup.string().required('This field is required'),
          exRate: yup.string().required('This field is required'),
          amount: yup.string().required('This field is required')
        })
      )
    })
  })

  const totalCUR = detailsFormik.values.rows.reduce((curSum, row) => {
    // Parse amount as a number
    const curValue = parseFloat(row.amount) || 0

    return curSum + curValue
  }, 0)

  const totalLoal = detailsFormik.values.rows.reduce((cumLocal, row) => {
    // Parse baseAmount as a number
    const curLocal = parseFloat(row.baseAmount) || 0

    return cumLocal + curLocal
  }, 0)

  const fillCurrencyStore = () => {
    try {
      var parameters = `_filter=`
      getRequest({
        extension: SystemRepository.Currency.qry,
        parameters: parameters
      }).then(res => {
        setCurrencyStore(res)
      })
    } catch (error) {
      setErrorMessage(error)
    }
  }

  const getCorrespondentById = async recordId => {
    try {
      if (recordId) {
        const _recordId = recordId
        const defaultParams = `_recordId=${_recordId}`
        var parameters = defaultParams

        getRequest({
          extension: RemittanceSettingsRepository.Correspondent.get,
          parameters: parameters
        }).then(res => {
          setToCurrency(res.record.currencyId)
        })
      } else setToCurrency(null)
    } catch (error) {
      setErrorMessage(error)
    }
  }

  const columns = [
    {
      field: 'combobox',
      header: labels[8],
      name: 'currencyId',
      mandatory: true,
      store: currencyStore.list,
      valueField: 'recordId',
      displayField: 'reference',
      widthDropDown: '200',
      fieldsToUpdate: [{ from: 'name', to: 'currencyName' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Reference' },
        { key: 'name', value: 'Name' }
      ],
      width: 230,
      async onChange(row) {
        if (toCurrency == null) {
          stackError({
            message: `Correspondant Cannot Be Empty.`
          })
          detailsFormik.resetForm()

          return
        }
        if (row?.newValue > 0) {
          const exchange = await fetchRate({
            currencyId: row.newValue
          })
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].currencyId`, row.newValue)
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].minRate`, exchange?.minRate)
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].maxRate`, exchange?.maxRate)
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].rateCalcMethod`, exchange?.rateCalcMethod)

          detailsFormik.setFieldValue(`rows[${row.rowIndex}].exRate1`, exchange?.rate)
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].exRate2`, exchange?.secondRate)
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].rateCalcMethod1`, exchange?.rateCalcMethod)
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].rateCalcMethod2`, exchange?.secondRateCalcMethod)
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].rateCalcMethod2`, exchange?.secondRateCalcMethod)
        } else {
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].currencyId`, '')
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].minRate`, 0)
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].maxRate`, 0)
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].rateCalcMethod`, 1)

          detailsFormik.setFieldValue(`rows[${row.rowIndex}].exRate1`, 1)
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].exRate2`, 1)
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].rateCalcMethod1`, 1)
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].rateCalcMethod2`, 1)

          return
        }
      }
    },
    {
      field: 'textfield',
      header: labels[9],
      name: 'currencyName',
      readOnly: true,
      width: 300
    },
    {
      field: 'textfield',
      header: labels[14],
      name: 'qty',
      mandatory: true,
      width: 100,
      async onChange(row) {
        const exchange = await fetchRate({
          currencyId: row.rowData.currencyId
        })
        const firstRate = exchange?.rate
        const secondRate = exchange?.secondRate
        const rateCalcMethod = exchange?.rateCalcMethod
        const secondRateCalcMethod = exchange?.secondRateCalcMethod

        const qtyToCur =
          rateCalcMethod === 1
            ? parseFloat(row.rowData.qty.toString().replace(/,/g, '')) * firstRate
            : rateCalcMethod === 2
            ? parseFloat(row.rowData.qty.toString().replace(/,/g, '')) / firstRate
            : 0

        const curToBase =
          secondRateCalcMethod === 1
            ? parseFloat(qtyToCur) * secondRate
            : secondRateCalcMethod === 2
            ? parseFloat(qtyToCur) / secondRate
            : 0
        detailsFormik.setFieldValue(`rows[${row.rowIndex}].exRate`, finalRate(row.rowData.qty, qtyToCur))
        detailsFormik.setFieldValue(`rows[${row.rowIndex}].amount`, qtyToCur)
        detailsFormik.setFieldValue(`rows[${row.rowIndex}].baseAmount`, curToBase)
      }
    },
    {
      field: 'textfield',
      header: labels[15],
      name: 'exRate',
      mandatory: true,
      width: 100,
      async onChange(row) {
        const nv = parseFloat(row.rowData.exRate.toString().replace(/,/g, ''))
        const minRate = parseFloat(row.rowData.minRate.toString().replace(/,/g, ''))
        const maxRate = parseFloat(row.rowData.maxRate.toString().replace(/,/g, ''))

        if (nv >= minRate && nv <= maxRate) {
          formik.setFieldValue(`rows[${row.rowIndex}].exRate`, row.value)

          const exchange = await fetchRate({
            currencyId: row.rowData.currencyId
          })
          const firstRate = nv
          const secondRate = exchange?.secondRate
          const rateCalcMethod = exchange?.rateCalcMethod
          const secondRateCalcMethod = exchange?.secondRateCalcMethod

          const qtyToCur =
            rateCalcMethod === 1
              ? parseFloat(row.rowData.qty.toString().replace(/,/g, '')) * firstRate
              : rateCalcMethod === 2
              ? parseFloat(row.rowData.qty.toString().replace(/,/g, '')) / firstRate
              : 0

          const curToBase =
            secondRateCalcMethod === 1
              ? parseFloat(qtyToCur) * secondRate
              : secondRateCalcMethod === 2
              ? parseFloat(qtyToCur) / secondRate
              : 0

          detailsFormik.setFieldValue(`rows[${row.rowIndex}].amount`, qtyToCur)
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].baseAmount`, curToBase)
        } else {
          stackError({
            message: `Rate not in the [${minRate}-${maxRate}] range.`
          })
          if (nv) {
            detailsFormik.setFieldValue(`rows[${row.rowIndex}].exRate`, '')
            detailsFormik.setFieldValue(`rows[${row.rowIndex}].amount`, 0)
            detailsFormik.setFieldValue(`rows[${row.rowIndex}].baseAmount`, 0)
          }
        }
      }
    },

    {
      field: 'textfield',
      header: 'baseAmount',
      name: 'baseAmount',
      mandatory: true,
      width: 100,
      hidden: true
    },
    {
      field: 'textfield',
      header: labels[10],
      name: 'amount',
      readOnly: true,
      mandatory: true,
      width: 100
    }
  ]

  const fillItemsGrid = orderId => {
    try {
      var parameters = `_orderId=${orderId}`
      getRequest({
        extension: CTTRXrepository.CreditOrderItem.qry,
        parameters: parameters
      }).then(res => {
        res.list.forEach(item => {
          /*    if (item.rateCalcMethod1 === 1 && item.rateCalcMethod2 === 1) {
            item.exRate = finalRate(item.exRate1,item.exRate2)
          } else if (item.rateCalcMethod1 === 2 && item.rateCalcMethod2 === 2) {
            item.exRate = finalRate(item.exRate1,item.exRate2)
          }
*/
          detailsFormik.values.rows.push(item)
        })

        detailsFormik.setValues({
          ...detailsFormik.values
        })
      })
    } catch (error) {
      setErrorMessage(error)
    }
  }

  const finalRate = (qty, amount) => {
    const rate = amount > qty ? amount / qty : qty / amount

    return rate
  }

  async function setOperationType(type) {
    if (type == SystemFunction.CurrencyCreditOrderPurchase || type == SystemFunction.CurrencyCreditOrderSale) {
      const res = await getRequest({
        extension: 'SY.asmx/getDE',
        parameters:
          type == SystemFunction.CurrencyCreditOrderPurchase
            ? '_key=ct_credit_purchase_ratetype_id'
            : type == SystemFunction.CurrencyCreditOrderSale
            ? '_key=ct_credit_sales_ratetype_id'
            : ''
      })
      setRateType(res.record.value)
      formik.setFieldValue('functionId', type)
    }
  }
  async function fetchRate({ currencyId }) {
    const plant = plantId ?? formik.values.plantId

    const response = await getRequest({
      extension: CurrencyTradingSettingsRepository.ExchangeMap.get2,
      parameters: `_plantId=${plant}&_fromCurrencyId=${currencyId}&_rateTypeId=${rateType}&_toCurrencyId=${toCurrency}`
    })

    return response.record
  }

  useEffect(() => {
    ;(async function () {
      try {
        fillCurrencyStore()
        if (recordId) {
          setIsLoading(true)

          //fillItemsGrid(recordId)

          const res = await getRequest({
            extension: CTTRXrepository.CreditOrder.get,
            parameters: `_recordId=${recordId}`
          })
          res.record.date = formatDateFromApi(res.record.date)
          setOperationType(res.record.functionId)
          setInitialData(res.record)
          getCorrespondentById(res.record.corId ?? '')
        }
      } catch (error) {
        //  setErrorMessage(error)
      } finally {
        setIsLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height])

  return (
    <FormShell resourceId={ResourceIds.CreditOrder} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <Grid container>
        <Grid container xs={12}>
          {/* First Column */}
          <Grid container rowGap={1} xs={3} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                required
                label={labels[2]}
                value={formik?.values?.date}
                onChange={formik.handleChange}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
              />
            </Grid>
          </Grid>
          {/* Second Column */}
          <Grid container rowGap={1} xs={6} sx={{ px: 2 }} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels[3]}
                readOnly={true}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('plantId', newValue?.recordId)
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
          </Grid>
          {/* Third Column */}
          <Grid container rowGap={1} xs={3} sx={{ px: 2 }} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels[4]}
                value={formik?.values?.reference}
                maxAccess={maxAccess}
                maxLength='30'
                readOnly={true}
                required
                error={formik.touched.reference && Boolean(formik.errors.reference)}
                helperText={formik.touched.reference && formik.errors.reference}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid container xs={12}>
          {/* First Column */}
          <Grid container rowGap={1} xs={3} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RemittanceSettingsRepository.Correspondent.qry}
                name='corId'
                label={labels[16]}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField={'reference'}
                required
                readOnly={detailsFormik?.values?.rows[0]?.currencyId != '' ? true : false}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  getCorrespondentById(newValue?.recordId)
                  formik.setFieldValue('corId', newValue?.recordId)
                  formik.setFieldValue('corName', newValue?.name || '')
                }}
                error={formik.touched.corId && Boolean(formik.errors.corId)}
              />
            </Grid>
          </Grid>
          {/* Second Column */}
          <Grid container rowGap={1} xs={6} sx={{ px: 2 }} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <CustomTextField
                name='corName'
                label={labels[17]}
                value={formik.values?.corName}
                maxAccess={maxAccess}
                required
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('corName', '')}
                error={formik.touched.corName && Boolean(formik.errors.corName)}
                helperText={formik.touched.corName && formik.errors.corName}
              />
            </Grid>
          </Grid>
          {/* Third Column */}
          <Grid container rowGap={1} xs={3} sx={{ px: 2 }} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <CustomDatePicker
                name='deliveryDate'
                label={labels[18]}
                value={formik?.values?.deliveryDate}
                onChange={formik.handleChange}
                maxAccess={maxAccess}
                disabledDate={'<='}
                onClear={() => formik.setFieldValue('deliveryDate', '')}
                error={formik.touched.deliveryDate && Boolean(formik.errors.deliveryDate)}
                helperText={formik.touched.deliveryDate && formik.errors.deliveryDate}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid container xs={12}>
          <RadioGroup
            row
            value={formik.values.functionId}
            defaultValue={SystemFunction.CurrencyCreditOrderPurchase}
            onChange={e => setOperationType(e.target.value)}
          >
            <FormControlLabel
              value={SystemFunction.CurrencyCreditOrderPurchase}
              control={<Radio />}
              label={labels[6]}
              disabled={detailsFormik?.values?.rows[0]?.currencyId != '' ? true : false}
            />
            <FormControlLabel
              value={SystemFunction.CurrencyCreditOrderSale}
              control={<Radio />}
              label={labels[7]}
              disabled={detailsFormik?.values?.rows[0]?.currencyId != '' ? true : false}
            />
          </RadioGroup>
        </Grid>
        <Grid container sx={{ pt: 2 }} xs={12}>
          <Box sx={{ width: '100%' }}>
            <InlineEditGrid
              gridValidation={detailsFormik}
              columns={columns}
              background={
                formik.values.functionId &&
                (formik.values.functionId != SystemFunction.CurrencyCreditOrderPurchase
                  ? '#C7F6C7'
                  : 'rgb(245, 194, 193)')
              }
              defaultRow={{
                orderId: '',
                seqNo: '',
                currencyId: '',
                qty: '',
                rateCalcMethod: '',
                exRate: '',
                baseAmount: '',
                amount: '',
                notes: ''
              }}
              allowDelete={true}
              allowAddNewLine={true}
              scrollable={true}
              scrollHeight={`${expanded ? height - 430 : 200}px`}
            />
          </Box>
        </Grid>
        <Grid
          container
          rowGap={1}
          xs={12}
          style={{ marginTop: '5px' }}
          sx={{ flexDirection: 'row', flexWrap: 'nowrap' }}
        >
          {/* First Column (moved to the left) */}
          <Grid container rowGap={1} xs={8} style={{ marginTop: '10px' }}>
            <CustomTextArea
              name='notes'
              label={labels[11]}
              value={formik.values.notes}
              rows={3}
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('notes', '')}
              error={formik.touched.notes && Boolean(formik.errors.notes)}
              helperText={formik.touched.notes && formik.errors.notes}
            />
          </Grid>
          {/* Second Column  */}
          <Grid container rowGap={1} xs={4} sx={{ px: 2 }} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <CustomTextField name='totalCUR' label={labels[12]} value={totalCUR} readOnly={true} />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField name='totalLocal' label={labels[13]} value={totalLoal} readOnly={true} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </FormShell>
  )
}
