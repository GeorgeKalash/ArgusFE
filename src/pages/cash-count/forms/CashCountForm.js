import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'

import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { useForm } from 'src/hooks/form'
import { CTTRXrepository } from 'src/repositories/CTTRXRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

export default function CashCountForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [editMode, setEditMode] = useState(!!recordId)

  const invalidate = useInvalidate({
    endpointId: CTTRXrepository.CashCount.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: null,
      reference: '',
      cashAccountId: '',
      cashAccountRef: '',
      cashAccountName: '',
      currencyId: '',
      currencyName: '',
      currencyRef: '',
      cashCount: [{ id: 1, currencyId: '', count: '', system: '', flag: '', note: '', qty: '', subTotal: '' }]
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: CTTRXrepository.CashCount.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
        setInitialData({
          ...obj,
          recordId: response.recordId
        })
      } else toast.success('Record Edited Successfully')
      setEditMode(true)

      invalidate()
    }
  })

  // useEffect(() => {
  //   ;(async function () {
  //     try {
  //       if (recordId) {
  //         const res = await getRequest({
  //           extension: CTTRXrepository.CashCount.get,
  //           parameters: `_recordId=${recordId}`
  //         })

  //         setInitialData(res.record)
  //       }
  //     } catch (exception) {
  //       setErrorMessage(error)
  //     }
  //   })()
  // }, [])

  return (
    <FormShell resourceId={ResourceIds.CashAccounts} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Fixed>
          <Grid container spacing={4} sx={{ mb: 3 }}>
            <Grid item xs={7}>
              <ResourceLookup
                endpointId={CashBankRepository.CashAccount.snapshot}
                parameters={{
                  _type: 2
                }}
                valueField='recordId'
                displayField='reference'
                name='cashAccountRef'
                label={labels.cashAccount}
                secondDisplayField={true}
                form={formik}
                firstValue={formik.values.cashAccountRef}
                secondValue={formik.values.cashAccountName}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('cashAccountId', newValue?.recordId)
                    formik.setFieldValue('cashAccountRef', newValue?.reference)
                    formik.setFieldValue('cashAccountName', newValue?.name)
                  } else {
                    formik.setFieldValue('cashAccountId', null)
                    formik.setFieldValue('cashAccountRef', null)
                    formik.setFieldValue('cashAccountName', null)
                  }
                }}
                errorCheck={'cashAccountId'}
                maxAccess={maxAccess}
                error={formik.touched.cashAccountId && Boolean(formik.errors.cashAccountId)}
              />
              <ResourceLookup
                endpointId={CashBankRepository.CashAccount.snapshot}
                parameters={{
                  _type: 2
                }}
                name='cashAccountId'
                required
                label={labels.businessPartner}
                valueField='reference'
                displayField='name'
                valueShow='cashAccountRef'
                secondValueShow='cashAccountName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setValues({
                    ...formik.values,
                    cashAccountId: newValue?.recordId || '',
                    cashAccountRef: newValue?.reference || '',
                    cashAccountName: newValue?.name || ''
                  })
                }}

                // maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={7}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Currency Ref' },
                  { key: 'name', value: 'Name' },
                  { key: 'flName', value: 'Foreign Language Name' }
                ]}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  const selectedCurrencyId = newValue?.recordId || ''
                  formik.setFieldValue('currencyId', selectedCurrencyId)
                }}
                error={formik.errors && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={7}>
              <CustomDatePicker
                name='date'
                label={labels.from}
                value={formik.values.date}
                onChange={formik.setFieldValue}
                readOnly={true}
              />
            </Grid>
            <Grid item xs={7}>
              <CustomTextField name='time' label={labels.time} value={formik.values.time} readOnly={true} />
            </Grid>
          </Grid>
        </Fixed>

        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('cashCount', value)}
            value={formik.values.cashCount}
            error={formik.errors.cashCount}
            columns={[
              {
                component: 'resourcecombobox',
                label: labels.currency,
                name: 'currencyId',
                props: {
                  endpointId: SystemRepository.Currency.qry,
                  valueField: 'recordId',
                  displayField: 'reference',
                  mapping: [
                    { from: 'recordId', to: 'currencyId' },
                    { from: 'reference', to: 'currencyRef' },
                    { from: 'name', to: 'currencyName' }
                  ],
                  columnsInDropDown: [
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ],
                  displayFieldWidth: 2
                }
              },
              {
                component: 'numberfield',
                name: 'count',
                label: labels.count
              },
              {
                component: 'numberfield',
                label: labels.system,
                name: 'system'
              },
              {
                component: 'numberfield',
                label: labels.flag,
                name: 'flag'
              },
              {
                component: 'numberfield',
                label: labels.note,
                name: 'note'
              },
              {
                component: 'numberfield',
                label: labels.qty,
                name: 'qty'
              },
              {
                component: 'numberfield',
                label: labels.subTotal,
                name: 'subTotal'
              }
            ]}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
