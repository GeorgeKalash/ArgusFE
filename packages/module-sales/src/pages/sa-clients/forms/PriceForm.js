import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function PriceForm({ labels, maxAccess, obj, recordId, window, fetchGridData }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: {
      clientId: recordId,
      categoryId: null,
      currencyId: null,
      priceType: '',
      value: ''
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      categoryId: yup.string().required(),
      currencyId: yup.string().required(),
      value: yup.number().required(),
      priceType: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: SaleRepository.Price.set,
        record: JSON.stringify(obj)
      })

      toast.success(platformLabels.Updated)
      window.close()
      fetchGridData()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (obj?.clientId) {
        const res = await getRequest({
          extension: SaleRepository.Price.get,
          parameters: `_clientId=${obj.clientId}&_categoryId=${obj.categoryId}&_currencyId=${obj.currencyId}&_priceType=${obj.priceType}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Category.qry}
                parameters='_pagesize=30&_startAt=0&_name='
                name='categoryId'
                label={labels.category}
                valueField='recordId'
                displayField={'name'}
                displayFieldWidth={1}
                required
                values={formik?.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('categoryId', newValue?.recordId || null)
                }}
                error={formik.touched.categoryId && Boolean(formik.errors.categoryId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                  { key: 'flName', value: 'FL Name' }
                ]}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.recordId || null)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.PRICE_TYPE}
                name='priceType'
                label={labels.priceType}
                valueField='key'
                required
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('priceType', newValue?.key)
                }}
                error={formik.touched.priceType && Boolean(formik.errors.priceType)}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomNumberField
                name='value'
                label={labels.value}
                value={formik.values.value}
                required
                maxAccess={maxAccess}
                allowNegative={false}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('value', '')}
                error={formik.touched.value && Boolean(formik.errors.value)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
