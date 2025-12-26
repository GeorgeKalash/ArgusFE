import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'

import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'

export default function DocumentTypeDefaultForm({ labels, maxAccess, recordId }) {
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: SaleRepository.DocumentTypeDefault.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      commitItems: false,
      dtId: '',

      disableSKULookup: false
    },
    maxAccess,
    validationSchema: yup.object({
      dtId: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        const response = await postRequest({
          extension: SaleRepository.DocumentTypeDefault.set,
          record: JSON.stringify(obj)
        })

        if (!formik.values.recordId) {
          formik.setFieldValue('recordId', formik.values.dtId)

          toast.success(platformLabels.Added)
        } else toast.success(platformLabels.Edited)

        invalidate()
      } catch (error) {}
    }
  })
  const editMode = !!formik.values.recordId

  console.log(formik.values)

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: SaleRepository.DocumentTypeDefault.get,
            parameters: `_dtId=${recordId}`
          })

          formik.setValues({ ...res.record, recordId: res.record.dtId })
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.DocumentTypeDefault} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${5106}`}
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
              <CustomCheckBox
                name='commitItems'
                value={formik.values?.commitItems}
                onChange={event => formik.setFieldValue('commitItems', event.target.checked)}
                label={labels.commitItems}
                maxAccess={maxAccess}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomCheckBox
                name='disableSKULookup'
                value={formik.values?.disableSKULookup}
                onChange={event => formik.setFieldValue('disableSKULookup', event.target.checked)}
                label={labels.dsl}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
