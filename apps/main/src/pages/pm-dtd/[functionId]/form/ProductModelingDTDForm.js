import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ProductModelingRepository } from '@argus/repositories/src/repositories/ProductModelingRepository'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

export default function ProductModelingDTDForm({ labels, maxAccess, recordId, functionId, resourceId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: ProductModelingRepository.DocumentTypeDefault.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId,
      dtId: null,
      productionLineId: null
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      dtId: yup.number().required(),
      productionLineId: yup.number().required(),
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: ProductModelingRepository.DocumentTypeDefault.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        formik.setFieldValue('recordId', obj.dtId)
      }

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)

      invalidate()
      window.close()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: ProductModelingRepository.DocumentTypeDefault.get,
          parameters: `_dtId=${recordId}`
        })

        formik.setValues({ ...res.record, recordId: recordId })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.ProductModelingDTD} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${functionId}`}
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
                  formik.setFieldValue('dtId', newValue?.recordId || null)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.ProductionLine.qry}
                parameters='_startAt=0&_pageSize=1000'
                values={formik.values}
                name='productionLineId'
                label={labels.productionLine}
                valueField='recordId'
                displayField={['reference', 'name']}
                displayFieldWidth={1}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                required
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('productionLineId', newValue?.recordId || null)
                }}
                error={formik.touched.productionLineId && formik.errors.productionLineId}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
