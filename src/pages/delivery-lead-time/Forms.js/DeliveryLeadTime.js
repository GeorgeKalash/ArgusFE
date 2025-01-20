import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DeliveryRepository } from 'src/repositories/DeliveryRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { SystemRepository } from 'src/repositories/SystemRepository'

export default function DeliveryLeadTimeForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: DeliveryRepository.DeliveryLeadTime.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId,
      szId: null,
      leadTimeInDays: null,
      smsTemplateId: null
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      szId: yup.number().required(),
      leadTimeInDays: yup.number().required().min(1).max(99)
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: DeliveryRepository.DeliveryLeadTime.set,
        record: JSON.stringify(obj)
      })

      if (!formik.values.recordId) {
        formik.setFieldValue('recordId', formik.values.szId)

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
          extension: DeliveryRepository.DeliveryLeadTime.get,
          parameters: `_szId=${recordId}`
        })

        formik.setValues({
          ...res.record,
          recordId: recordId
        })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.DeliveryLeadTimes} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SaleRepository.SalesZone.qry}
                parameters={`_startAt=0&_pageSize=1000&_sortField="recordId"&_filter=`}
                name='szId'
                label={labels.saleZone}
                readOnly={editMode}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('szId', newValue?.recordId)
                }}
                error={formik.touched.szId && Boolean(formik.errors.szId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='leadTimeInDays'
                label={labels.leadTimeInDays}
                value={formik.values.leadTimeInDays}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('leadTimeInDays', '')}
                required
                maxLength='2'
                decimalScale={0}
                allowNegative={false}
                error={formik.touched.leadTimeInDays && Boolean(formik.errors.leadTimeInDays)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.SMSTemplate.qry}
                name='smsTemplateId'
                label={labels.smsTemplate}
                displayField='name'
                valueField='recordId'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('smsTemplateId', newValue?.recordId)
                }}
                maxAccess={maxAccess}
                error={formik.touched.smsTemplateId && Boolean(formik.errors.smsTemplateId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
