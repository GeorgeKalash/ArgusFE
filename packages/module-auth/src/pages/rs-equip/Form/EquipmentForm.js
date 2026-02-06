import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { RepairAndServiceRepository } from '@argus/repositories/src/repositories/RepairAndServiceRepository'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import FieldSet from '@argus/shared-ui/src/components/Shared/FieldSet'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import { PurchaseRepository } from '@argus/repositories/src/repositories/PurchaseRepository'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'

export default function EquipmentForm({ labels, maxAccess, store, setStore }) {
  const { recordId } = store
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: RepairAndServiceRepository.Equipment.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId,
      reference: '',
      make: '',
      description: '',
      model: '',
      plantId: null,
      color: '',
      maintTplId: null,
      year: null,
      serialNo: '',
      hasMeter: false,
      primaryMeter: null,
      secondaryMeter: null,
      currentPM: null,
      currentSM: null,
      purc_primMeter: null,
      purc_secMeter: null,
      purc_date: null,
      purc_price: null,
      purc_vendorId: null,
      operatorId: null,
      activeStatus: null
    },
    validationSchema: yup.object({
      reference: yup.string().required(),
      description: yup.string().required(),
      purc_primMeter: yup
        .number()
        .nullable()
        .test('purc_primMeter-check', 'Purchase value must be less than or equal to current value', function (value) {
          const { currentPM } = this.parent
          if (value == null || currentPM == null) return true

          return value <= currentPM
        }),
      purc_secMeter: yup
        .number()
        .nullable()
        .test('purc_secMeter-check', 'Purchase value must be less than or equal to current value', function (value) {
          const { currentSM } = this.parent
          if (value == null || currentSM == null) return true

          return value <= currentSM
        })
    }),
    onSubmit: async values => {
      await postRequest({
        extension: RepairAndServiceRepository.Equipment.set,
        record: JSON.stringify({
          ...values,
          purc_date: values?.purc_date ? formatDateToApi(values?.purc_date) : null
        })
      }).then(res => {
        formik.setFieldValue('recordId', res.recordId)
        toast.success(!values.recordId ? platformLabels.Added : platformLabels.Edited)

        setStore(prevStore => ({
          ...prevStore,
          recordId: res.recordId
        }))

        invalidate()
      })
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: RepairAndServiceRepository.Equipment.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues({
          ...res.record,
          purc_date: formatDateFromApi(res?.record?.purc_date)
        })

        setStore(prevStore => ({
          ...prevStore,
          recordId: recordId
        }))
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Equipment} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <CustomTextField
            name='reference'
            label={labels.reference}
            value={formik.values?.reference}
            required
            maxAccess={maxAccess}
            maxLength='10'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('reference', '')}
            error={formik.touched.reference && Boolean(formik.errors.reference)}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomTextField
            name='make'
            label={labels.make}
            value={formik.values?.make}
            maxAccess={maxAccess}
            maxLength='20'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('make', '')}
            error={formik.touched.make && Boolean(formik.errors.make)}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomTextField
            name='description'
            label={labels.description}
            value={formik.values?.description}
            maxAccess={maxAccess}
            maxLength='100'
            required
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('description', '')}
            error={formik.touched.description && Boolean(formik.errors.description)}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomTextField
            name='model'
            label={labels.model}
            value={formik.values?.model}
            maxAccess={maxAccess}
            maxLength='20'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('model', '')}
            error={formik.touched.model && Boolean(formik.errors.model)}
          />
        </Grid>
        <Grid item xs={6}>
          <ResourceComboBox
            endpointId={SystemRepository.Plant.qry}
            name='plantId'
            label={labels.plant}
            valueField='recordId'
            displayField={['reference', 'name']}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            values={formik.values}
            onChange={(event, newValue) => {
              formik.setFieldValue('plantId', newValue?.recordId || null)
            }}
            error={formik.touched.plantId && Boolean(formik.errors.plantId)}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomTextField
            name='color'
            label={labels.color}
            value={formik.values?.color}
            maxAccess={maxAccess}
            maxLength='20'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('color', '')}
            error={formik.touched.color && Boolean(formik.errors.color)}
          />
        </Grid>
        <Grid item xs={6}>
          <ResourceComboBox
            endpointId={RepairAndServiceRepository.MaintenanceTemplates.qry}
            name='maintTplId'
            label={labels.maintTplId}
            valueField='recordId'
            displayField='name'
            values={formik.values}
            onChange={(event, newValue) => {
              formik.setFieldValue('maintTplId', newValue?.recordId || null)
            }}
            error={formik.touched.maintTplId && Boolean(formik.errors.maintTplId)}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomNumberField
            name='year'
            label={labels.year}
            value={formik.values.year}
            onChange={formik.handleChange}
            maxLength='4'
            decimalScale={0}
            onClear={() => formik.setFieldValue('year', null)}
            error={formik.touched.year && Boolean(formik.errors.year)}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomTextField
            name='serialNo'
            label={labels.serialNo}
            value={formik.values?.serialNo}
            maxAccess={maxAccess}
            maxLength='30'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('serialNo', '')}
            error={formik.touched.serialNo && Boolean(formik.errors.serialNo)}
          />
        </Grid>
        <Grid item xs={6}></Grid>
        <Grid item xs={12}>
          <FieldSet title={labels.meter}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <CustomCheckBox
                  name='hasMeter'
                  value={formik.values?.hasMeter}
                  onChange={event => formik.setFieldValue('hasMeter', event.target.checked)}
                  label={labels.hasMeter}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={4}>
                <ResourceComboBox
                  datasetId={DataSets.RS_EQUIPMENT_METER}
                  name='primaryMeter'
                  label={labels.primaryMeter}
                  values={formik.values}
                  valueField='key'
                  displayField='value'
                  readOnly={!formik.values.hasMeter}
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('primaryMeter', newValue?.key || null)
                  }}
                  error={formik.touched.primaryMeter && Boolean(formik.errors.primaryMeter)}
                />
              </Grid>
              <Grid item xs={4}>
                <CustomNumberField
                  name='currentPM'
                  label={labels.current}
                  value={formik.values.currentPM}
                  onChange={formik.handleChange}
                  maxLength='18'
                  decimalScale={3}
                  readOnly={!formik.values.hasMeter}
                  onClear={() => formik.setFieldValue('currentPM', null)}
                  error={formik.touched.currentPM && Boolean(formik.errors.currentPM)}
                />
              </Grid>
              <Grid item xs={4}>
                <CustomNumberField
                  name='purc_primMeter'
                  label={labels.purchase}
                  value={formik.values.purc_primMeter}
                  onChange={formik.handleChange}
                  maxLength='18'
                  decimalScale={3}
                  readOnly={!formik.values.hasMeter}
                  onClear={() => formik.setFieldValue('purc_primMeter', null)}
                  error={formik.touched.purc_primMeter && Boolean(formik.errors.purc_primMeter)}
                />
              </Grid>
              <Grid item xs={4}>
                <ResourceComboBox
                  datasetId={DataSets.RS_EQUIPMENT_METER}
                  name='secondaryMeter'
                  label={labels.secondaryMeter}
                  values={formik.values}
                  valueField='key'
                  displayField='value'
                  readOnly={!formik.values.primaryMeter}
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('secondaryMeter', newValue?.key || null)
                  }}
                  error={formik.touched.secondaryMeter && Boolean(formik.errors.secondaryMeter)}
                />
              </Grid>
              <Grid item xs={4}>
                <CustomNumberField
                  name='currentSM'
                  label={labels.current}
                  value={formik.values.currentSM}
                  onChange={formik.handleChange}
                  readOnly={!formik.values.primaryMeter}
                  maxLength='18'
                  decimalScale={3}
                  onClear={() => formik.setFieldValue('currentSM', null)}
                  error={formik.touched.currentSM && Boolean(formik.errors.currentSM)}
                />
              </Grid>
              <Grid item xs={4}>
                <CustomNumberField
                  name='purc_secMeter'
                  label={labels.purchase}
                  value={formik.values.purc_secMeter}
                  onChange={formik.handleChange}
                  readOnly={!formik.values.primaryMeter}
                  maxLength='18'
                  decimalScale={3}
                  onClear={() => formik.setFieldValue('purc_secMeter', null)}
                  error={formik.touched.purc_secMeter && Boolean(formik.errors.purc_secMeter)}
                />
              </Grid>
            </Grid>
          </FieldSet>
        </Grid>
        <Grid item xs={6}>
          <CustomDatePicker
            name='purc_date'
            label={labels.purc_date}
            value={formik?.values?.purc_date}
            onChange={formik.setFieldValue}
            maxAccess={maxAccess}
            onClear={() => formik.setFieldValue('purc_date', null)}
            error={formik.touched.purc_date && Boolean(formik.errors.purc_date)}
          />
        </Grid>
        <Grid item xs={6}>
          <ResourceComboBox
            endpointId={PurchaseRepository.Vendor.qry}
            parameters={`_startAt=0&_pageSize=50&_params=&_sortField=`}
            name='purc_vendorId'
            label={labels.vendor}
            valueField='recordId'
            displayField={['reference', 'name']}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            values={formik.values}
            onChange={(event, newValue) => {
              formik.setFieldValue('purc_vendorId', newValue?.recordId || null)
            }}
            error={formik.touched.purc_vendorId && Boolean(formik.errors.purc_vendorId)}
          />
        </Grid>
        <Grid item xs={6}>
          <ResourceComboBox
            endpointId={RepairAndServiceRepository.RsLabors.qry}
            name='operatorId'
            label={labels.operatorId}
            valueField='recordId'
            displayField={['reference', 'firstName']}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'firstName', value: 'Name' }
            ]}
            values={formik.values}
            onChange={(event, newValue) => {
              formik.setFieldValue('operatorId', newValue?.recordId || null)
            }}
            error={formik.touched.operatorId && Boolean(formik.errors.operatorId)}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomNumberField
            name='purc_price'
            label={labels.purc_price}
            value={formik.values.purc_price}
            onChange={formik.handleChange}
            maxLength='16'
            decimalScale={2}
            onClear={() => formik.setFieldValue('purc_price', null)}
            error={formik.touched.purc_price && Boolean(formik.errors.purc_price)}
          />
        </Grid>
        <Grid item xs={6}>
          <ResourceComboBox
            datasetId={DataSets.ACTIVE_STATUS}
            name='activeStatus'
            label={labels.activeStatus}
            values={formik.values}
            valueField='key'
            displayField='value'
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('activeStatus', newValue?.key || null)
            }}
            error={formik.touched.activeStatus && Boolean(formik.errors.activeStatus)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
