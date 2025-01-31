import { Grid } from '@mui/material'
import React, { useContext } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useForm } from 'src/hooks/form'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { CashCountRepository } from 'src/repositories/CashCountRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { ControlContext } from 'src/providers/ControlContext'

export default function GenerateTransferForm({ cashCountId, fromPlantId, labels, maxAccess }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

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
      toPlantId: yup.string().required(),
      toAccountId: yup.string().required()
    }),
    onSubmit: async obj => {
      const data = {
        cashCountId,
        fromPlantId,
        toPlantId: obj.toPlantId,
        toAccountId: obj.toAccountId
      }
      await postRequest({
        extension: CashCountRepository.Generate.generate,
        record: JSON.stringify(data)
      })
      toast.success(platformLabels.Generated)
    }
  })

  return (
    <FormShell form={formik} maxAccess={maxAccess} isCleared={false} isInfo={false}>
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
                  if (formik) {
                    formik.setFieldValue('toPlantId', newValue?.recordId)
                  }
                  formik.setFieldValue('toAccountId', null)
                  formik.setFieldValue('fromCARef', null)
                  formik.setFieldValue('fromCAName', null)
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
