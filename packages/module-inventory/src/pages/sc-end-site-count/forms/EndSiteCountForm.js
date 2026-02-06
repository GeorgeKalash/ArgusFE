import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SCRepository } from '@argus/repositories/src/repositories/SCRepository'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import toast from 'react-hot-toast'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function EndSiteCountForm({ _labels, access }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: {
      stockCountId: '',
      siteId: '',
      notes: '',
      status: ''
    },
    maxAccess: access,
    validateOnChange: true,
    validationSchema: yup.object({
      stockCountId: yup.string().required(),
      siteId: yup.string().required()
    }),
    onSubmit: async obj => {
      if (obj.status === 3) {
        await postRequest({
          extension: SCRepository.Sites.reopen,
          record: JSON.stringify(obj)
        })
        toast.success(platformLabels.Saved)
      } else {
        await postRequest({
          extension: SCRepository.Sites.end,
          record: JSON.stringify(obj)
        })

        toast.success(platformLabels.Saved)
      }

      formik.resetForm()
    }
  })

  const actions = [
    {
      key: 'Locked',
      condition: formik.values.status === 3,
      onClick: () => formik.handleSubmit(),
      disabled: false
    },
    {
      key: 'Unlocked',
      condition: formik.values.status !== 3,
      onClick: () => formik.handleSubmit(),
      disabled: false
    }
  ]

  return (
    <Form onSave={formik.handleSubmit} actions={actions} maxAccess={access} isSaved={false} editMode={true}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
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
                  formik.setFieldValue('notes', '')
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
                displayField={['siteRef', 'siteName']}
                columnsInDropDown={[
                  { key: 'siteRef', value: 'Reference' },
                  { key: 'siteName', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('siteId', newValue ? newValue?.siteId : '')
                  formik.setFieldValue('notes', newValue ? newValue?.notes : '')
                  formik.setFieldValue('status', newValue ? newValue?.status : '')
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
    </Form>
  )
}
