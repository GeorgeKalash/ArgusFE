import { useContext } from 'react'
import { Grid } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useForm } from 'src/hooks/form'
import { useInvalidate } from 'src/hooks/resource'
import { ControlContext } from 'src/providers/ControlContext'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { DataSets } from 'src/resources/DataSets'

const SalesForm = ({ labels, maxAccess, store, record, cId }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: SaleRepository.Sales.qry
  })

  const { recordId: itemId } = store

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      itemId,
      currencyId: cId,
      plId: '',
      priceType: '',
      valueType: '',
      value: '',
      priceWithVat: '',
      minPrice: '',

      ...record
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      currencyId: yup.string().required(),
      plId: yup.string().required(),
      priceType: yup.string().required(),
      value: yup.number().required().typeError(),
      valueType: yup.string().required(),
      minPrice: yup
        .number()
        .nullable()
        .test(function (value) {
          const { value: price } = this.parent

          return value == null || price == null || value <= price
        })
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: SaleRepository.Sales.set,
        record: JSON.stringify(obj)
      })

      if (!formik.values.plId && !formik.values.currencyId) {
        toast.success(platformLabels.Added)
      } else toast.success(platformLabels.Edited)

      formik.setValues(obj)

      invalidate()
    }
  })
  const editMode = !!record

  useEffect(() => {
    ;(async function () {
      if (record && record.plId) {
        try {
          const res = await getRequest({
            extension: SaleRepository.Sales.get,
            parameters: `_itemId=${itemId}&_plId=${formik.values.plId}&_currencyId=${formik.values.currencyId}`
          })

          formik.setValues(res?.record)
        } catch (error) {}
      }
    })()
  }, [record])

  useEffect(() => {
    if (!editMode) {
      ;(async () => {
        const responsePriceLevel = await getRequest({
          extension: SaleRepository.PriceLevel.qry,
          parameters: `_filter=`
        })
        formik.setFieldValue('plId', responsePriceLevel?.list[0]?.recordId)

        const responsePriceType = await getRequest({
          extension: InventoryRepository.Items.pack
        })
        formik.setFieldValue('priceType', parseInt(responsePriceType?.record?.priceTypes[0]?.key))
      })()
    }
  }, [])

  return (
    <FormShell
      form={formik}
      infoVisible={false}
      resourceId={ResourceIds.PriceList}
      maxAccess={maxAccess}
      editMode={editMode}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SaleRepository.PriceLevel.qry}
                parameters='_filter='
                name='plId'
                label={labels.priceLevel}
                valueField='recordId'
                displayField={'name'}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                maxAccess={maxAccess}
                readOnly={editMode}
                required
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plId', newValue ? newValue.recordId : '')
                }}
                error={formik.touched.plId && Boolean(formik.errors.plId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Currency.qry}
                parameters={itemId ? `_itemId=${itemId}` : ''}
                name='currencyId'
                label={labels.currency}
                valueField='currencyId'
                displayField={['currencyName']}
                columnsInDropDown={[{ key: 'currencyName', value: 'Name' }]}
                values={formik.values}
                readOnly
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.currencyId || '')
                }}
                onClear={() => formik.setFieldValue('currencyId', '')}
                error={!formik.values.currencyId && formik.errors.currencyId}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Items.pack}
                reducer={response => {
                  const formattedPriceTypes = response?.record?.priceTypes.map(priceTypes => ({
                    key: parseInt(priceTypes.key),
                    value: priceTypes.value
                  }))

                  return formattedPriceTypes
                }}
                values={formik.values}
                name='priceType'
                label={labels.priceType}
                valueField='key'
                displayField='value'
                displayFieldWidth={1}
                required
                maxAccess={!editMode && maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('priceType', newValue?.key || '')
                }}
                error={formik.touched.priceType && formik.errors.priceType}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.VALUE_TYPE}
                name='valueType'
                label={labels.valueType}
                required
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('valueType', newValue?.key || '')
                }}
                error={formik.touched.valueType && Boolean(formik.errors.valueType)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='value'
                label={labels.price}
                value={formik.values.value}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('value', '')}
                required
                error={formik.touched.value && Boolean(formik.errors.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='priceWithVat'
                label={labels.pwv}
                value={formik.values.priceWithVat}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('priceWithVat', '')}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='minPrice'
                label={labels.minPrice}
                value={formik.values.minPrice}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('minPrice', '')}
                error={formik.touched.minPrice && Boolean(formik.errors.minPrice)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default SalesForm
