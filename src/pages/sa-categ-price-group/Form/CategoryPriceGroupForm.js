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
import { InventoryRepository } from 'src/repositories/InventoryRepository'

export default function CategoryPriceGroupForm({ labels, maxAccess, record, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: SaleRepository.CategoryPriceGroup.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId,
      pgId: null,
      categoryId: null,
      unitPrice: null
    },
    validateOnChange: true,
    validationSchema: yup.object({
      unitPrice: yup.number().required(),
      pgId: yup.number().required(),
      categoryId: yup.number().required()
    }),
    onSubmit: async obj => {
      const categoryId = formik.values.categoryId
      const pgId = formik.values.pgId

      await postRequest({
        extension: SaleRepository.CategoryPriceGroup.set,
        record: JSON.stringify(obj)
      })

      if (!categoryId && !pgId) {
        toast.success(platformLabels.Added)
      } else toast.success(platformLabels.Edited)
      formik.setFieldValue('recordId', String(obj.pgId) + String(obj.categoryId))

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId
  useEffect(() => {
    ;(async function () {
      if (record && record.pgId && record.categoryId && recordId) {
        const res = await getRequest({
          extension: SaleRepository.CategoryPriceGroup.get,
          parameters: `_pgId=${record.pgId}&_categoryId=${record.categoryId}`
        })

        formik.setValues({
          ...res.record,
          recordId: String(res.record.pgId) + String(res.record.categoryId)
        })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.CategoryPriceGroup} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SaleRepository.PriceGroups.qry}
                name='pgId'
                label={labels.priceGroup}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly={editMode}
                required
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('pgId', newValue?.recordId || null)
                }}
                onClear={() => formik.setFieldValue('pgId', '')}
                error={formik.touched.pgId && Boolean(formik.errors.pgId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Category.qry}
                parameters='_pagesize=30&_startAt=0&_name='
                name='categoryId'
                required
                label={labels.itemCategory}
                valueField='recordId'
                displayField={['caRef', 'name']}
                columnsInDropDown={[
                  { key: 'caRef', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                displayFieldWidth={1}
                readOnly={editMode}
                values={formik?.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('categoryId', newValue?.recordId || null)
                }}
                error={formik.touched.categoryId && Boolean(formik.errors.categoryId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='unitPrice'
                label={labels.unitPrice}
                value={formik.values.unitPrice}
                onChange={formik.handleChange}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('unitPrice', '')}
                required
                maxLength={12}
                decimalScale={2}
                error={formik.touched.unitPrice && Boolean(formik.errors.unitPrice)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
