import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { CurrencyTradingSettingsRepository } from '@argus/repositories/src/repositories/CurrencyTradingSettingsRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

export default function PurposeOfExchangeForm({ labels, maxAccess, recordId, setStore }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: CurrencyTradingSettingsRepository.PurposeExchange.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      reference: '',
      groupId: ''
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      reference: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: CurrencyTradingSettingsRepository.PurposeExchange.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        setStore({
          recordId: response.recordId,
          name: obj.name
        })
        formik.setFieldValue('recordId', response.recordId)
      } else {
        setStore(prev => ({ ...prev, name: obj.name }))
      }
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: CurrencyTradingSettingsRepository.PurposeExchange.get,
          parameters: `_recordId=${recordId}`
        })
        setStore({
          recordId: res.record.recordId,
          name: res.record.name
        })
        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.PurposeOfExchange} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                rows={2}
                maxAccess={maxAccess}
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
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={CurrencyTradingSettingsRepository.PurposeExchangeGroup.qry}
                name='groupId'
                label={labels.group}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('groupId', newValue?.recordId)
                }}
                error={formik.touched.groupId && Boolean(formik.errors.groupId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
