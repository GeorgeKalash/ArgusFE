import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

import { ControlContext } from 'src/providers/ControlContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'

export default function CaDocumentTypeDefaultForm({ labels, maxAccess, recordId }) {
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.DocumentTypeDefault.qry
  })

  const { formik } = useForm({
    initialValues: {
      dtId: '',
      plantId: '',
      recordId: recordId || null,
      cashAccountId: '',
      fromCashAccountId: '',
      toCashAccountId: '',
      fromCashAccountRef: '',
      fromCashAccountName: '',
      toCashAccountName: '',
      toCashAccountRef: ''
    },
    maxAccess,
    enableReinitialize: false,
    validationSchema: yup.object({
      dtId: yup.string().required(),
      fromCashAccountId: yup.string().nullable(),
      toCashAccountId: yup
        .string()
        .nullable()
        .test(function (value) {
          const { fromCashAccountId } = this.parent
          if (!value || !fromCashAccountId) return true

          return value !== fromCashAccountId
        })
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: CashBankRepository.DocumentTypeDefault.set,
        record: JSON.stringify(obj)
      })

      if (!formik.values.recordId) {
        formik.setFieldValue('recordId', formik.values.dtId)

        toast.success(platformLabels.Added)
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: CashBankRepository.DocumentTypeDefault.get,
          parameters: `_dtId=${recordId}`
        })

        formik.setValues({
          ...res.record,
          recordId: recordId,
          disableSKULookup: Boolean(res.record.disableSKULookup)
        })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.CaDtd} form={formik} maxAccess={maxAccess} editMode={editMode} isCleared={false}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${3303}`}
                name='dtId'
                required
                label={labels.documentType}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                readOnly={editMode}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('dtId', newValue?.recordId || '')
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={platformLabels.plant}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'plant Ref' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue?.recordId || '')
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={CashBankRepository.CashAccount.snapshot}
                parameters={{
                  _type: 0
                }}
                name='cashAccountId'
                label={labels.cA}
                valueField='reference'
                displayField='name'
                valueShow='cashAccountRef'
                secondValueShow='cashAccountName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('cashAccountId', newValue?.recordId || '')
                  formik.setFieldValue('cashAccountRef', newValue?.reference || '')
                  formik.setFieldValue('cashAccountName', newValue?.name || '')
                }}
                error={formik.touched.cashAccountId && Boolean(formik.errors.cashAccountId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={CashBankRepository.CashAccount.snapshot}
                parameters={{
                  _type: 0
                }}
                valueField='reference'
                displayField='name'
                name='fromCashAccountId'
                displayFieldWidth={2}
                label={labels.fromCa}
                form={formik}
                valueShow='fromCashAccountRef'
                secondValueShow='fromCashAccountName'
                onChange={(event, newValue) => {
                  formik.setFieldValue('fromCashAccountId', newValue ? newValue.recordId : null)
                  formik.setFieldValue('fromCashAccountRef', newValue ? newValue.reference : null)
                  formik.setFieldValue('fromCashAccountName', newValue ? newValue.name : null)
                }}
                error={formik.touched.fromCashAccountId && Boolean(formik.errors.fromCashAccountId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={CashBankRepository.CashAccount.snapshot}
                parameters={{
                  _type: 0
                }}
                valueField='reference'
                displayField='name'
                name='toCashAccountId'
                displayFieldWidth={2}
                label={labels.toCa}
                form={formik}
                valueShow='toCashAccountRef'
                secondValueShow='toashAccountName'
                onChange={(event, newValue) => {
                  formik.setFieldValue('toCashAccountId', newValue ? newValue.recordId : null)
                  formik.setFieldValue('toCashAccountRef', newValue ? newValue.reference : null)
                  formik.setFieldValue('toashAccountName', newValue ? newValue.name : null)
                }}
                error={formik.touched.toCashAccountId && Boolean(formik.errors.toCashAccountId)}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
