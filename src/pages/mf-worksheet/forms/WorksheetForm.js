import { Grid } from '@mui/material'
import { useContext, useEffect, useState, useRef } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import ImageUpload from 'src/components/Inputs/ImageUpload'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { useRefBehavior } from 'src/hooks/useReferenceProxy'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomDateTimePicker from 'src/components/Inputs/CustomDateTimePicker'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'

export default function WorksheetForm({ labels, access, setStore, store }) {
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.Worksheet.page
  })
  const imageUploadRef = useRef(null)

  // const { changeDT, maxAccess } = useRefBehavior({
  //   access: access,
  //   readOnlyOnEditMode: store.recordId,
  //   name: 'sku'
  // })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      dtId: null,
      reference: '',
      designRef: '',
      status: 1,
      releaseStatus: null,
      date: new Date(),
      jobId: null,
      workCenterId: null,
      laborId: null,
      siteId: null,
      notes: '',
      qty: null,
      routingId: null,
      seqNo: null,
      wipQty: '',
      rmQty: null,
      wipPcs: null,
      duration: 0.0,
      startTime: null,
      endTime: null,
      wgtBefore: null,
      wgtAfter: null,
      eopQty: null,
      damagedPcs: null
    },
    access,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      jobId: yup.number().required(),
      workCenterId: yup.number().required(),
      laborId: yup.number().required(),
      wipQty: yup.number().required(),
      siteId: yup.number().required(),
      qty: yup.number().required(),
      wipQty: yup.number().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: ManufacturingRepository.Worksheet.set,
        record: JSON.stringify({ ...obj, attachment: null })
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
        setStore(prevStore => ({
          ...prevStore,
          recordId: response.recordId
        }))
      } else {
        toast.success(platformLabels.Edited)
      }

      invalidate()
    }
  })

  const editMode = !!recordId || formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: ManufacturingRepository.Worksheet.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  // const actions = [
  //   {
  //     key: 'RecordRemarks',
  //     condition: true,
  //     onClick: 'onRecordRemarks',
  //     disabled: !editMode
  //   },
  //   {
  //     key: 'Integration Account',
  //     condition: true,
  //     onClick: 'onClickGIA',
  //     masterSource: MasterSource.Item,
  //     disabled: !editMode
  //   }
  // ]

  return (
    <FormShell resourceId={ResourceIds.Worksheet} form={formik} maxAccess={access} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Fixed>
                <Grid container spacing={4}>
                  <Grid item xs={4}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <ResourceComboBox
                          endpointId={SystemRepository.DocumentType.qry}
                          parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.Worksheet}`}
                          name='dtId'
                          label={labels.documentType}
                          columnsInDropDown={[
                            { key: 'reference', value: 'Reference' },
                            { key: 'name', value: 'Name' }
                          ]}
                          valueField='recordId'
                          displayField={['reference', 'name']}
                          readOnly={editMode}
                          values={formik.values}
                          maxAccess={access}
                          onChange={(event, newValue) => {
                            formik && formik.setFieldValue('dtId', newValue?.recordId || null)
                          }}
                          error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <CustomTextField
                          name='reference'
                          label={labels.reference}
                          value={formik.values.reference}
                          readOnly={editMode}
                          maxLength='15'
                          maxAccess={access}
                          onChange={formik.handleChange}
                          onClear={() => formik.setFieldValue('reference', '')}
                          error={formik.touched.reference && Boolean(formik.errors.reference)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <ResourceLookup
                          endpointId={ManufacturingRepository.MFJobOrder.snapshot}
                          name='jobRef'
                          label={labels.job}
                          valueField='reference'
                          displayField='name'
                          valueShow='jobRef'
                          required
                          secondValueShow='jobName'
                          form={formik}
                          onChange={(event, newValue) => {
                            formik.setValues({
                              jobId: newValue?.recordId || null,
                              jobRef: newValue?.reference || '',
                              jobName: newValue?.name || ''
                            })
                          }}
                          errorCheck={'jobId'}
                          maxAccess={access}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <ResourceComboBox
                          endpointId={ManufacturingRepository.WorkCenter.qry}
                          name='workCenterId'
                          label={labels.workCenter}
                          readOnly={!formik.values.jobId}
                          valueField='recordId'
                          displayField={['reference', 'name']}
                          columnsInDropDown={[
                            { key: 'reference', value: 'Reference' },
                            { key: 'name', value: 'Name' }
                          ]}
                          values={formik.values}
                          required
                          maxAccess={access}
                          onChange={(event, newValue) => {
                            formik.setFieldValue('workCenterId', newValue?.recordId || null)
                          }}
                          error={formik.touched.workCenterId && formik.errors.workCenterId}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <ResourceLookup
                          endpointId={ManufacturingRepository.Labor.snapshot}
                          name='laborId'
                          label={labels.labor}
                          valueField='reference'
                          displayField='name'
                          valueShow='laborRef'
                          required
                          readOnly={!formik.values.workCenterId}
                          secondValueShow='laborName'
                          form={formik}
                          onChange={(event, newValue) => {
                            formik.setValues({
                              laborId: newValue?.recordId || null,
                              laborRef: newValue?.reference || '',
                              laborName: newValue?.name || ''
                            })
                          }}
                          errorCheck={'laborId'}
                          maxAccess={access}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <CustomNumberField
                          name='wipQty'
                          required
                          label={labels.Qty}
                          value={formik?.values?.wipQty}
                          maxAccess={access}
                          onChange={formik.handleChange}
                          onClear={() => formik.setFieldValue('wipQty', '')}
                          error={formik.touched.wipQty && Boolean(formik.errors.wipQty)}
                          decimalScale={3}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <CustomNumberField
                          name='wipPcs'
                          label={labels.wipPcs}
                          value={formik?.values?.wipPcs}
                          maxAccess={access}
                          onChange={formik.handleChange}
                          onClear={() => formik.setFieldValue('wipPcs', '')}
                          error={formik.touched.wipPcs && Boolean(formik.errors.wipPcs)}
                          decimalScale={3}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <CustomNumberField
                          name='damagedPcs'
                          label={labels.damagedPcs}
                          value={formik?.values?.damagedPcs}
                          maxAccess={access}
                          onChange={formik.handleChange}
                          onClear={() => formik.setFieldValue('damagedPcs', '')}
                          error={formik.touched.damagedPcs && Boolean(formik.errors.damagedPcs)}
                          decimalScale={3}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={4}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <CustomTextField
                          name='itemName'
                          label={labels.PgItem}
                          value={formik.values.itemName}
                          readOnly
                          maxAccess={access}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <ResourceComboBox
                          endpointId={InventoryRepository.Site.qry}
                          name='siteId'
                          label={labels.site}
                          required
                          values={formik.values}
                          displayField='name'
                          maxAccess={access}
                          onChange={(event, newValue) => {
                            formik.setFieldValue('siteId', newValue?.recordId || null)
                          }}
                          error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <CustomTextField
                          name='designRef'
                          label={labels.designRef}
                          value={formik.values.designRef}
                          readOnly
                          maxAccess={access}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <CustomTextField
                          name='joQty'
                          label={labels.joQty}
                          value={formik.values.joQty}
                          required
                          readOnly
                          maxAccess={access}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <CustomTextField
                          name='joPcs'
                          label={labels.joPcs}
                          value={formik.values.joPcs}
                          readOnly
                          maxAccess={access}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <CustomNumberField
                          name='rmQty'
                          label={labels.Qty}
                          value={formik?.values?.rmQty}
                          maxAccess={access}
                          onChange={formik.handleChange}
                          onClear={() => formik.setFieldValue('rmQty', '')}
                          error={formik.touched.rmQty && Boolean(formik.errors.rmQty)}
                          decimalScale={3}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <CustomNumberField
                          name='wgtBefore'
                          label={labels.wgtBefore}
                          value={formik?.values?.wgtBefore}
                          maxAccess={access}
                          onChange={formik.handleChange}
                          onClear={() => formik.setFieldValue('wgtBefore', '')}
                          error={formik.touched.wgtBefore && Boolean(formik.errors.wgtBefore)}
                          decimalScale={3}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <CustomNumberField
                          name='wgtAfter'
                          label={labels.wgtAfter}
                          value={formik?.values?.wgtAfter}
                          maxAccess={access}
                          onChange={formik.handleChange}
                          onClear={() => formik.setFieldValue('wgtAfter', '')}
                          error={formik.touched.wgtAfter && Boolean(formik.errors.wgtAfter)}
                          decimalScale={3}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={4}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <ImageUpload
                          ref={imageUploadRef}
                          resourceId={ResourceIds.Worksheet}
                          seqNo={0}
                          recordId={recordId}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <CustomNumberField
                          name='eopQty'
                          label={labels.eopQty}
                          value={formik?.values?.eopQty}
                          maxAccess={access}
                          onChange={formik.handleChange}
                          onClear={() => formik.setFieldValue('eopQty', '')}
                          error={formik.touched.eopQty && Boolean(formik.errors.eopQty)}
                          decimalScale={3}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <CustomDatePicker
                          name='date'
                          label={labels.date}
                          value={formik.values.date}
                          onChange={formik.setFieldValue}
                          maxAccess={access}
                          onClear={() => formik.setFieldValue('date', '')}
                          error={formik.touched.date && Boolean(formik.errors.date)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <CustomDateTimePicker
                          name='startTime'
                          label={labels.startTime}
                          value={formik.values?.startTime}
                          onChange={(name, newValue) => {
                            formik.setFieldValue(startTime, newValue)
                          }}
                          maxAccess={access}
                          error={formik.errors?.startTime && Boolean(formik.errors?.startTime)}
                          onClear={() => formik.setFieldValue(startTime, undefined)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <CustomDateTimePicker
                          name='endTime'
                          label={labels.endTime}
                          value={formik.values?.endTime}
                          onChange={(name, newValue) => {
                            formik.setFieldValue(endTime, newValue)
                          }}
                          maxAccess={access}
                          error={formik.errors?.endTime && Boolean(formik.errors?.endTime)}
                          onClear={() => formik.setFieldValue(endTime, undefined)}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Fixed>
            </Grid>
            <Grid item xs={12}>
              <Grow></Grow>
            </Grid>
            <Grid item xs={12}>
              <Fixed>
                <Grid container spacing={4}>
                  <Grid item xs={6}>
                    <CustomTextArea
                      name='notes'
                      label={labels.notes}
                      value={formik.values.notes}
                      rows={3}
                      maxLength='100'
                      editMode={editMode}
                      maxAccess={access}
                      onChange={e => formik.setFieldValue('notes', e.target.value)}
                      onClear={() => formik.setFieldValue('notes', '')}
                    />
                  </Grid>
                  <Grid item xs={6}></Grid>
                </Grid>
              </Fixed>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
