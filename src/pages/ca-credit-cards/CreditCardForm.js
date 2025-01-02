import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'

export default function CreditCardForm({ recordId, labels, maxAccess }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.CreditCard.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId,
      reference: '',
      name: '',
      bankId: '',
      creditCardFees: [{ id: 1, creditCardId: recordId, seqNo: 1, upToAmount: 0, commissionFees: 0, isPct: false }]
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      reference: yup.string().required(),
      bankId: yup.string().required(),
      creditCardFees: yup
        .array()
        .of(
          yup.object().shape({
            upToAmount: yup.string().required(),
            commissionFees: yup.string().required()
          })
        )
        .required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: CashBankRepository.CreditCard.set,
        record: JSON.stringify({
          recordId: obj.recordId,
          name: obj.name,
          reference: obj.reference,
          bankId: obj.bankId
        })
      })

      await postRequest({
        extension: CashBankRepository.CreditCard.set2,
        record: JSON.stringify({
          creditCardId: response?.recordId,
          fees: obj.creditCardFees.map(({ ...item }, index) => ({
            seqNo: index + 1,
            creditCardId: response?.recordId,
            ...item
          }))
        })
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)

        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      } else {
        toast.success(platformLabels.Edited)
      }

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: CashBankRepository.CreditCard.get,
          parameters: `_recordId=${recordId}`
        })

        const resCredit = await getRequest({
          extension: CashBankRepository.CreditCardFees.qry,
          parameters: `_creditCardId=${recordId}`
        })

        formik.setValues({
          ...res.record,
          creditCardFees: resCredit.list?.map(({ ...item }, index) => ({
            id: index + 1,
            ...item
          }))
        })
      }
    })()
  }, [])

  const columns = [
    {
      component: 'numberfield',
      label: labels?.upToAmount,
      name: 'upToAmount',
      props: {
        maxLength: 12,
        decimalScale: 0
      }
    },
    {
      component: 'numberfield',
      label: labels?.commissionFees,
      name: 'commissionFees',
      props: {
        maxLength: 15,
        decimalScale: 3
      }
    },
    {
      component: 'checkbox',
      label: labels?.isPct,
      name: 'isPct',
      flex: 0.4
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.CreditCard}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isCleared={false}
    >
      <VertLayout>
        <Fixed>
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
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={CashBankRepository.CbBank.qry}
                name='bankId'
                required
                label={labels.bank}
                valueField='recordId'
                displayField={'name'}
                columnsInDropDown={[{ key: 'name', value: 'name' }]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('bankId', newValue?.recordId || null)
                }}
                error={formik.touched.bankId && Boolean(formik.errors.bankId)}
              />
            </Grid>
          </Grid>
        </Fixed>

        <Grow>
          <DataGrid
            onChange={value => {
              formik.setFieldValue('creditCardFees', value)
            }}
            name='creditCardFees'
            value={formik.values.creditCardFees}
            error={formik.errors.creditCardFees}
            columns={columns}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
