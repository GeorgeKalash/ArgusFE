import { Grid, Grow } from '@mui/material'
import React, { useContext } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useForm } from 'src/hooks/form'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { CashCountRepository } from 'src/repositories/CashCountRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'

export default function GenerateTransferForm({ cashCountId, fromPlantId, labels, maxAccess }) {
  const { postRequest } = useContext(RequestsContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      cashCountId: cashCountId,
      fromPlantId: fromPlantId,
      toPlantId: '',
      toAccountId: ''
    },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      toPlantId: yup.string().required(' '),
      toAccountId: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      console.log(obj)

      const data = {
        cashCountId,
        fromPlantId,
        toPlantId: obj.toPlantId,
        toAccountId: obj.toAccountId
      }
      try {
        await postRequest({
          extension: CashCountRepository.CashCountTransaction.generate,
          record: JSON.stringify(data)
        })
        if (!obj.recordId) {
          toast.success('Record Added Successfully')
        } else toast.success('Record Edited Successfully')
      } catch (error) {}
    }
  })

  return (
    <FormShell
      resourceId={ResourceIds.CashCountTransaction}
      form={formik}
      maxAccess={maxAccess}
      isCleared={false}
      isInfo={false}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='toPlantId'
                label={labels.toPlant}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('toPlantId', newValue?.recordId)
                }}
                error={formik.touched.toPlantId && Boolean(formik.errors.toPlantId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={CashBankRepository.CashAccount.snapshot}
                parameters={{
                  _type: 0
                }}
                filter={{ plantId: formik.values.toPlantId }}
                firstFieldWidth='40%'
                valueField='accountNo'
                displayField='name'
                name='toAccountId'
                displayFieldWidth={2}
                required
                label={labels.toCashAccount}
                form={formik}
                valueShow='fromCARef'
                secondValueShow='fromCAName'
                onChange={(event, newValue) => {
                  formik.setFieldValue('toAccountId', newValue ? newValue.recordId : null)
                  formik.setFieldValue('fromCARef', newValue ? newValue.accountNo : null)
                  formik.setFieldValue('fromCAName', newValue ? newValue.name : null)
                }}
                error={formik.touched.toAccountId && Boolean(formik.errors.toAccountId)}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
