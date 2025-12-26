import { Grid } from '@mui/material'
import React, { useContext } from 'react'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { CashBankRepository } from '@argus/repositories/src/repositories/CashBankRepository'
import { CashCountRepository } from '@argus/repositories/src/repositories/CashCountRepository'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'

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
          extension: CashCountRepository.Generate.generate,
          record: JSON.stringify(data)
        })
        toast.success(platformLabels.Generated)
      } catch (error) {}
    }
  })

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
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
                firstFieldWidth={5}
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
    </Form>
  )
}
