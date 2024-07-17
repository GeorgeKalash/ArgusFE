import { useEffect, useContext } from 'react'
import toast from 'react-hot-toast'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Grid } from '@mui/material'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { useForm } from 'src/hooks/form.js'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomTextField from '../Inputs/CustomTextField'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { ControlContext } from 'src/providers/ControlContext'

export default function ExpensesCostCenters({ labels, maxAccess, row, window, updateRow, recordId }) {
    const { platformLabels } = useContext(ControlContext)

    const { formik } = useForm({
        maxAccess,
        enableReinitialize: true,
        validateOnChange: true,
        initialValues: {
          costCenters: row.costCenters || [{
            id: 1,
            pvId: recordId || 0,
            seqNo: 1,
            ccSeqNo: '',
            ccId: '',
            amount: '',
          }],
          row,
          balance: null,
          amountAssigned: null,
        },
        validate: values => {
            const errors = {}
            if (values.balance != 0) {
              errors.balance = ' '
            }

            return errors
        },         
        onSubmit: async obj => {
            try {
                const costCenters = obj.costCenters.map((costCenter, index) => ({
                        ...costCenter,
                        id: row.id,
                        ccSeqNo: index + 1,
                        seqNo: row.id,
                        pvId: recordId
                    })
                );

                updateRow({ changes: { costCenters } })
                
                toast.success(platformLabels.Added)
                window.close()
            } catch (error) { }
        }
    })
            
  const columns = [
    {
        component: 'resourcelookup',
        label: labels.costCenter,
        name: 'reference',
        props: {
          valueField: 'reference',
          displayField: 'reference',
          displayFieldWidth: 2,
          endpointId: GeneralLedgerRepository.CostCenter.snapshot,
          mapping: [
            { from: 'recordId', to: 'ccId' },
            { from: 'name', to: 'ccName' },
            { from: 'reference', to: 'ccRef' }
          ],
          columnsInDropDown: [
            { key: 'reference', value: 'Reference' },
            { key: 'name', value: 'Name' }
          ]
        }
      },
      {
        component: 'textfield',
        label: labels.name,
        name: 'ccName',
        props: {
          readOnly: true
        }
      },
      {
        component: 'textfield',
        label: labels.amount,
        name: 'amount',
        props: {
          readOnly: false
        }
      },
  ]


    const totalAmount = formik.values?.costCenters?.reduce((amount, row) => {
      const amountValue = parseFloat(row.amount?.toString().replace(/,/g, '')) || 0

      return amount + amountValue
    }, 0)


    const balance = row.amount - totalAmount

    useEffect(() => {
        formik.setFieldValue('balance', balance)
    }, [balance])


  return (
    <FormShell
      resourceId={ResourceIds.PaymentVoucherExpenses}
      form={formik}
      maxAccess={maxAccess}
      isCleared={false}
      isInfo={false}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={4}>
            <Grid item xs={12}>
                <CustomTextField
                    name='amount'
                    label={labels.amount}
                    value={row.amount}
                    maxAccess={maxAccess}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('amount', '')}
                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                />
            </Grid>
            <Grid item xs={12}>
                <CustomTextField
                    name='amountAssigned'
                    label={labels.amountAssigned}
                    value={totalAmount}
                    maxAccess={maxAccess}
                    readOnly
                />
            </Grid>
            <Grid item xs={12}>
                <CustomTextField
                    name='balance'
                    label={labels.balance}
                    value={formik.values.balance}
                    maxAccess={maxAccess}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('balance', '')}
                    error={formik.touched.balance && Boolean(formik.errors.balance)}
                />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => {
              formik.setFieldValue('costCenters', value)
            }}
            value={formik.values.costCenters}
            error={formik.errors.costCenters}
            columns={columns}
            allowDelete={true}
            allowAddNewLine={true}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
