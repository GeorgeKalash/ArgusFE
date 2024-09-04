import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ControlContext } from 'src/providers/ControlContext'
import { SCRepository } from 'src/repositories/SCRepository'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import toast from 'react-hot-toast'

export default function EndSiteCountForm({ _labels, access }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: {
      stockCountId: '',
      siteId: '',
      notes: '',
      status: '',
      statusName: ''
    },
    enableReinitialize: true,
    maxAccess: access,
    validateOnChange: true,
    validationSchema: yup.object({
      stockCountId: yup.string().required(),
      siteId: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        if (obj.status === 1) {
            await postRequest({
                extension: SCRepository.Sites.reopen,
                record: JSON.stringify(obj)
            })
        } else if (obj.status === 3) {
            await postRequest({
                extension: SCRepository.Sites.end,
                record: JSON.stringify(obj)
            })
        }

        toast.success(platformLabels.Saved)
        formik.resetForm();
      } catch (error) {}
    }
  })

  const actions = [
    {
      key: 'Post',
      condition: formik.values.statusName === 'Processed',
      onClick: () => formik.handleSubmit(),
      disabled: false
    },
    {
        key: 'Reopen',
        condition: formik.values.statusName !== 'Processed',
        onClick: () => formik.handleSubmit(),
        disabled: false
    }
  ]

  return (
    <FormShell form={formik} actions={actions} isSaved={false} editMode={true} isInfo={false} isCleared={false}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SCRepository.StockCount.qry}
                parameters={`_startAt=0&_pageSize=50&_params=`}
                name='stockCountId'
                label={_labels.stockCount}
                valueField='recordId'
                displayField='reference'
                values={formik.values}
                required
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('stockCountId', newValue?.recordId)
                }}
                error={formik.touched.stockCountId && Boolean(formik.errors.stockCountId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                name='siteId'
                endpointId={SCRepository.Sites.qry}
                parameters={formik.values.stockCountId ? `_stockCountId=${formik.values.stockCountId}` : ''}
                label={_labels.site}
                filter={item => item.isChecked}
                valueField='siteId'
                displayField='siteName'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('siteId', newValue ? newValue?.siteId : '')
                  formik.setFieldValue('notes', newValue ? newValue?.notes : '')
                  formik.setFieldValue('status', newValue ? newValue?.status : '')
                  formik.setFieldValue('statusName', newValue ? newValue?.statusName : '')
                }}
                error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='notes'
                type='text'
                label={_labels.notes}
                readOnly
                value={formik.values.notes}
                maxAccess={access}
                onChange={e => formik.setFieldValue('notes', e.target.value)}
                onClear={() => formik.setFieldValue('notes', '')}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
