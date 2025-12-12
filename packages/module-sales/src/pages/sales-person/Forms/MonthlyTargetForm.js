import { useContext } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form.js'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { Grid } from '@mui/material'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { AuthContext } from '@argus/shared-providers/src/providers/AuthContext'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const MonthlyTargetForm = ({ store, labels, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store
  const { platformLabels } = useContext(ControlContext)
  const { user } = useContext(AuthContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId,
      fiscalYear: null,
      targetAmount: 0,
      balance: '',
      rows: [
        {
          id: 1,
          spId: recordId,
          monthId: null,
          month: '',
          targetAmount: 0,
          fiscalYear: null
        }
      ]
    },
    validationSchema: yup.object({
      fiscalYear: yup.string().required()
    }),
    onSubmit: async obj => {
      const updatedRows = obj.rows.map((monthDetail, index) => {
        return {
          ...monthDetail,
          id: index + 1,
          month: parseInt(monthDetail.monthId),
          fiscalYear: obj.fiscalYear,
          targetAmount: monthDetail?.targetAmount || 0
        }
      })

      const updatedRowsWithoutMonthId = updatedRows.map(monthDetail => {
        const { monthId, ...rest } = monthDetail

        return rest
      })

      const resultObject = {
        spId: recordId,
        fiscalYear: obj.fiscalYear,
        items: updatedRowsWithoutMonthId
      }

      await postRequest({
        extension: SaleRepository.TargetMonth.set2,
        record: JSON.stringify(resultObject)
      })
      toast.success(platformLabels.Updated)
    }
  })

  const columns = [
    {
      component: 'textfield',
      label: labels.month,
      name: 'month',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels?.targetAmount,
      name: 'targetAmount',
      props: {
        maxLength: 12,
        decimalScale: 0,
        allowNegative: false
      }
    }
  ]

  const totalAmount = formik.values.rows.reduce((sumAmount, row) => {
    const amountValue = parseFloat(row.targetAmount?.toString().replace(/,/g, '')) || 0

    return sumAmount + amountValue
  }, 0)

  const targetAmountValue = parseFloat(formik.values.targetAmount?.toString().replace(/,/g, '')) || 0
  const balance = totalAmount - targetAmountValue || 0

  const changeFiscal = async selectedFiscal => {
    if (selectedFiscal) {
      const res = await getRequest({
        extension: SaleRepository.Target.get,
        parameters: `_fiscalYear=${selectedFiscal}&_spId=${recordId}`
      })

      formik.setFieldValue('targetAmount', res.record?.targetAmount || 0)

      const monthRes = await getRequest({
        extension: SystemRepository.KeyValueStore,
        parameters: `_dataset=${DataSets.MONTHS}&_language=${user?.languageId}`
      })

      const sortedList = monthRes.list.sort((a, b) => parseInt(a.key, 10) - parseInt(b.key, 10))

      if (sortedList.length > 0) {
        const amountRes = await getRequest({
          extension: SaleRepository.TargetMonth.qry,
          parameters: `_spId=${recordId}&_fiscalYear=${selectedFiscal}`
        })

        const newRows = sortedList.map((monthObj, index) => {
          const correspondingAmount = amountRes.list.find(amountObj => amountObj.month === parseInt(monthObj.key))

          return {
            id: index + 1,
            spId: recordId,
            monthId: monthObj.key,
            month: String(monthObj?.value),
            targetAmount: correspondingAmount?.targetAmount || 0
          }
        })

        formik.setFieldValue('rows', newRows)
      }
    } else {
      formik.setValues({
        ...formik.values,
        targetAmount: 0,
        rows: []
      })
    }
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} isParentWindow={false}>
      <VertLayout>
        <Fixed>
          <Grid container spacing={2} sx={{ p: 2 }}>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalYears.qry}
                name='fiscalYear'
                label={labels.year}
                valueField='fiscalYear'
                displayField='fiscalYear'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('fiscalYear', newValue?.fiscalYear || null)
                  changeFiscal(newValue?.fiscalYear)
                }}
                onClear={() => {
                  formik.setFieldValue('fiscalYear', null)
                  changeFiscal(null)
                }}
                error={formik.touched.fiscalYear && Boolean(formik.errors.fiscalYear)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='targetAmount'
                label={labels.targetAmount}
                value={formik.values.targetAmount}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('rows', value)}
            value={formik.values?.rows}
            error={formik.errors?.rows}
            name='rows'
            initialValues={formik?.initialValues?.rows}
            columns={columns}
            maxAccess={maxAccess}
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2} sx={{ p: 2 }} justifyContent='flex-end'>
            <Grid item xs={3}>
              <CustomNumberField name='balance' label={labels.balance} value={balance} maxAccess={maxAccess} readOnly />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </Form>
  )
}

export default MonthlyTargetForm
