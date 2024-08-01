import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import { SaleRepository } from 'src/repositories/SaleRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

export default function DocumentTypeDefaultForm({ labels, maxAccess, dtId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: SaleRepository.DocumentTypeDefault.qry
  })

  const { formik } = useForm({
    initialValues: {
      dtId: dtId || null,
      spId: '',
      minUnitPrice: '',
      maxUnitPrice: ''
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      reference: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        const response = await postRequest({
          extension: SaleRepository.DocumentTypeDefault.set,
          record: JSON.stringify(obj)
        })

        if (!obj.dtId) {
          toast.success(platformLabels.Added)
          formik.setFieldValue('dtId', response.dtId)
        } else toast.success(platformLabels.Edited)

        invalidate()
      } catch (error) {}
    }
  })
  const editMode = !!formik.values.dtId
  useEffect(() => {
    ;(async function () {
      try {
        if (dtId) {
          const res = await getRequest({
            extension: SaleRepository.DocumentTypeDefault.get,
            parameters: `_dtId=${dtId}`
          })

          formik.setValues({ ...res.record, recordId: dtId })
        }
      } catch (error) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.DocumentTypeDefault} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            {/* <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SaleRepository.DocumentType.qry}
                parameters={`_dgId=5100&_startAt=0&_pageSize=1000&_filter=`}
                name='dtId'
                label={labels.documentType}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly={editMode}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('dtId', newValue?.recordId)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                helperText={formik.touched.dtId && formik.errors.dtId}
              />
            </Grid> */}
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SaleRepository.SalesPerson.qry}
                name='spId'
                label={labels.salesPerson}
                valueField='recordId'
                displayField='name'
                columnsInDropDown={[{ key: 'name', value: 'name' }]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('spId', newValue ? newValue.recordId : '')
                }}
                error={formik.touched.spId && Boolean(formik.errors.spId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='minUnitPrice'
                required
                label={labels.minUnitPrice}
                value={formik.values.minUnitPrice}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('minUnitPrice', '')}
                error={formik.touched.minUnitPrice && Boolean(formik.errors.minUnitPrice)}
                allowNegative={false}
                decimalScale={3}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='maxUnitPrice'
                label={labels.maxUnitPrice}
                value={formik.values.maxUnitPrice}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('maxUnitPrice', '')}
                error={formik.touched.maxUnitPrice && Boolean(formik.errors.maxUnitPrice)}
                allowNegative={false}
                decimalScale={3}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
