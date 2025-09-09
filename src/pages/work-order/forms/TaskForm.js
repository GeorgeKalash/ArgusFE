import { useContext } from 'react'
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
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
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import { RepairAndServiceRepository } from 'src/repositories/RepairAndServiceRepository'
<<<<<<< .merge_file_vcZfWj
import { DataSets } from 'src/resources/DataSets'
=======
>>>>>>> .merge_file_bbP8m4

const TaskForm = ({ labels, editMode, maxAccess, store, record }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: RepairAndServiceRepository.WorkTask.qry
  })

  const { recordId: itemId } = store

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      itemId,
      vendorId: record?.vendorId || '',
      currencyId: record?.currencyId || '',
      baseLaborPrice: '',
      priceList: '',
      markdown: '',
      sku: '',
      isPreferred: false,
      deliveryLeadDays: ''
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      vendorId: yup.string().required(),
      currencyId: yup.string().required(),
      baseLaborPrice: yup.string().required(),
      priceList: yup.string().required()
    }),
    onSubmit: async obj => {
      const vendorId = formik.values.vendorId
      const currencyId = formik.values.currencyId

      const submitData = {
        ...obj,
        markdown: obj.markdown || 0
      }

      const response = await postRequest({
        extension: RepairAndServiceRepository.WorkTask.set,
        record: JSON.stringify(submitData)
      })

      if (!vendorId && !currencyId) {
        toast.success(platformLabels.Added)
      } else {
        toast.success(platformLabels.Edited)
      }

      formik.setValues(submitData)

      invalidate()
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      if (record && record.currencyId && record.vendorId) {
        const res = await getRequest({
          extension: RepairAndServiceRepository.WorkTask.get,
          parameters: `_itemId=${itemId}&_vendorId=${formik.values.vendorId}&_currencyId=${formik.values.currencyId}`
        })

        if (res.record) {
          formik.setValues(res.record)
        }
      }
    }

    fetchData()
  }, [record])

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
<<<<<<< .merge_file_vcZfWj
              <ResourceComboBox
                datasetId={DataSets.RS_PRIORITY}
                name='priority'
                label={labels.priority}
                valueField='key'
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('priority', newValue?.key || null)
                }}
                error={formik.touched.priority && Boolean(formik.errors.priority)}
=======
              <ResourceLookup
                endpointId={PurchaseRepository.Vendor.snapshot}
                name='vendorId'
                label={labels.vendor}
                form={formik}
                displayFieldWidth={2}
                valueField='vendorRef'
                displayField='name'
                required
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueShow='vendorRef'
                secondValueShow='vendorName'
                onChange={(event, newValue) => {
                  formik.setFieldValue('vendorId', newValue.recordId || '')
                  formik.setFieldValue('vendorName', newValue.name || '')
                  formik.setFieldValue('vendorRef', newValue.reference || '')
                }}
>>>>>>> .merge_file_bbP8m4
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
<<<<<<< .merge_file_vcZfWj
                endpointId={RepairAndServiceRepository.EquipmentType.qry}
                parameters='_filter=&_size=30&_startAt=0&_equipmentId=11'
=======
                endpointId={SystemRepository.Currency.qry}
>>>>>>> .merge_file_bbP8m4
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
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
              <CustomNumberField
                name='baseLaborPrice'
                label={labels.baseLabor}
                value={formik.values.baseLaborPrice}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('baseLaborPrice', '')}
                required
                error={formik.touched.baseLaborPrice && Boolean(formik.errors.baseLaborPrice)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='priceList'
                label={labels.priceList}
                value={formik.values.priceList}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('priceList', '')}
                required
                error={formik.touched.priceList && Boolean(formik.errors.priceList)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='markdown'
                label={labels.markdown}
                value={formik.values.markdown}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('markdown', '')}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='sku'
                label={labels.sku}
                value={formik.values.sku}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('sku', '')}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='isPreferred'
                value={formik.values?.isPreferred}
                onChange={event => formik.setFieldValue('isPreferred', event.target.checked)}
                label={labels.isPreffered}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='deliveryLeadDays'
                label={labels.dld}
                value={formik.values.deliveryLeadDays}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('deliveryLeadDays', '')}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default TaskForm
