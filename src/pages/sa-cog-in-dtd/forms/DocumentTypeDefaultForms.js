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
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

import { ControlContext } from 'src/providers/ControlContext'
import { SaleRepository } from 'src/repositories/SaleRepository'

export default function DocumentTypeDefaultForm({ labels, maxAccess, dtId }) {
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: SaleRepository.DocumentTypeDefault.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: dtId || null,
      commitItems: false,
      dtId: '',

      disableSKULookup: false
    },
    maxAccess,
    enableReinitialize: false,
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
        if (dtId) {
          const res = await getRequest({
            extension: SaleRepository.DocumentTypeDefault.get,
            parameters: `_dtId=${dtId}`
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
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${5107}`}
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
              <FormControlLabel
                control={
                  <Checkbox
                    maxAccess={maxAccess}
                    name='commitItems'
                    checked={formik.values?.commitItems}
                    onChange={formik.handleChange}
                  />
                }
                label={labels.commitItems}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    maxAccess={maxAccess}
                    name='disableSKULookup'
                    checked={formik.values?.disableSKULookup}
                    onChange={formik.handleChange}
                  />
                }
                label={labels.dsl}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
