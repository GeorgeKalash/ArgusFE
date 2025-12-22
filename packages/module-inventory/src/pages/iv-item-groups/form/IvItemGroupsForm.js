import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { MasterSource } from '@argus/shared-domain/src/resources/MasterSource'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'

export default function IvItemGroupsForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.Group.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId,
      reference: '',
      name: '',
      valuationMethod: '',
      procurementMethod: '',
      msId: ''
    },
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      reference: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: InventoryRepository.Group.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', response.recordId)
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId
  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: InventoryRepository.Group.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  const actions = [
    {
      key: 'Integration Account',
      condition: true,
      onClick: 'onClickGIA',
      masterSource: MasterSource.ItemGroup,
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.InventoryGroup}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                required
                label={labels.reference}
                value={formik.values.reference}
                maxAccess={maxAccess}
                maxLength='30'
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
                datasetId={DataSets.PROCUREMENT_METHOD}
                name='procurementMethod'
                label={labels.procurement}
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('procurementMethod', newValue?.key || '')
                }}
                error={formik.touched.procurementMethod && formik.errors.procurementMethod}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.VALUATION_METHOD}
                values={formik.values}
                name='valuationMethod'
                label={labels.valuation}
                valueField='key'
                displayField='value'
                displayFieldWidth={1}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('valuationMethod', newValue?.key || '')
                }}
                error={formik.touched.valuationMethod && formik.errors.valuationMethod}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Measurement.qry}
                parameters='_name='
                name='msId'
                label={labels.measurement}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('msId', newValue.recordId || '')
                }}
                error={formik.touched.msId && Boolean(formik.errors.msId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
