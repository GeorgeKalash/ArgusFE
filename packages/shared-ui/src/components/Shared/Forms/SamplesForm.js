import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect, useRef } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { ProductModelingRepository } from '@argus/repositories/src/repositories/ProductModelingRepository'
import ImageUpload from '@argus/shared-ui/src/components/Inputs/ImageUpload'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

export default function SamplesForm({ recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const imageUploadRef = useRef(null)
  
  const { labels, access } = useResourceParams({
      datasetId: ResourceIds.Samples,
      editMode: !!recordId
    })

    useSetWindow({ title: labels.samples, window })
    
  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.Samples,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: ProductModelingRepository.Samples.page
  })

  const conditions = {
    sku: row => row?.sku,
    stonePct: row => row?.stonePct != null,
    weight: row => row?.weight != null,
    pcs: row => row?.pcs != null,
    itemName: row => row?.itemName
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'rows')

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    conditionSchema: ['rows'],
    initialValues: {
      recordId,
      header: {
        recordId,
        dtId: null,
        reference: '',
        date: new Date(),
        productionStandardId: null,
        productionClassId: null,
        weight: null,
        siteId: null,
        collectionId: null,
        jobId: null,
        itemId: null,
        threeDDId: null,
        productionLineId: null,
        designFamilyId: null,
        designGroupId: null,
        statusName: '',
        notes: '',
        status: 1
      },
      rows: [
        {
          id: 1,
          sampleId: recordId,
          sku: '',
          itemName: '',
          weight: null,
          pcs: null,
          stonePct: null,
          seqNo: ''
        }
      ]
    },
    validateOnChange: true,
    validationSchema: yup.object({
      header: yup.object({
        productionStandardId: yup.number().required(),
        productionClassId: yup.number().required(),
        weight: yup.number().required(),
        siteId: yup.number().required(),
        collectionId: yup.number().required(),
        jobId: yup.number().required(),
        threeDDId: yup.number().required(),
        productionLineId: yup.number().required(),
        date: yup.date().required()
      }),
      rows: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      const { rows, header } = obj

      const headerData = {
        ...header,
        date: formatDateToApi(header.date)
      }

      const updatedRows = rows
        ?.filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
        .map((prodDetails, index) => {
          return {
            ...prodDetails,
            sampleId: recordId ?? 0,
            seqNo: index + 1
          }
        })

      const resultObject = {
        header: headerData,
        items: updatedRows
      }

      const res = await postRequest({
        extension: ProductModelingRepository.Samples.set2,
        record: JSON.stringify(resultObject)
      })

      if (imageUploadRef.current) {
        imageUploadRef.current.value = res.recordId

        await imageUploadRef.current.submit()
      }

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
      refetchForm(res?.recordId)
    }
  })

  const editMode = !!formik.values.recordId
  const isPosted = formik.values.header.status === 3
  const isClosed = formik.values.header.wip === 2

  async function onPost() {
    await postRequest({
      extension: ProductModelingRepository.Samples.post,
      record: JSON.stringify({
        ...formik?.values?.header,
        date: formatDateToApi(formik?.values?.header.date)
      })
    })
    toast.success(platformLabels.Posted)
    window.close()
    invalidate()
  }

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      width: 100,
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        valueField: 'sku',
        displayField: 'sku',
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 2
      }
    },
    {
      component: 'numberfield',
      name: 'pcs',
      label: labels.pcs,
      width: 100,
      props: {
        maxLength: 4
      }
    },
    {
      component: 'numberfield',
      name: 'weight',
      label: labels.weight,
      width: 100,
      props: {
        maxLength: 10,
        decimalScale: 3
      }
    },
    {
      component: 'numberfield',
      name: 'stonePct',
      label: labels.stonePct,
      width: 100,
      props: {
        maxLength: 5,
        decimalScale: 2
      }
    }
  ]
  async function refetchForm(recordId) {
    const res = await getRequest({
      extension: ProductModelingRepository.Samples.get2,
      parameters: `_recordId=${recordId}`
    })

    const modifiedList = res?.record?.items?.length
      ? res?.record?.items?.map((item, index) => ({
          ...item,
          id: index + 1
        }))
      : formik.initialValues.rows

    formik.setValues({
      recordId: res?.record?.header?.recordId,
      header: {
        ...res?.record?.header,
        date: formatDateFromApi(res?.record?.header?.date)
      },
      rows: modifiedList
    })

    return res?.record
  }

  useEffect(() => {
    if (recordId) refetchForm(recordId)
  }, [])

  const onClose = async () => {
    await postRequest({
      extension: ProductModelingRepository.Samples.close,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Closed)
    refetchForm(formik?.values?.header?.recordId)
    invalidate()
  }

  const onReopen = async () => {
    await postRequest({
      extension: ProductModelingRepository.Samples.reopen,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Closed)
    refetchForm(formik?.values?.header?.recordId)
    invalidate()
  }

  const actions = [
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode || !isClosed
    },
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      disabled: true
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || isPosted
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.Samples}
      functionId={SystemFunction.Samples}
      form={formik}
      maxAccess={maxAccess}
      actions={actions}
      editMode={editMode}
      previewReport={editMode}
      disabledSubmit={isClosed}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.Samples}`}
                    name='header.dtId'
                    label={labels.documentType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.dtId', newValue?.recordId || null)
                      changeDT(newValue)
                    }}
                    error={formik.touched?.header?.dtId && Boolean(formik.errors?.header?.dtId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='header.reference'
                    label={labels.reference}
                    value={formik?.values?.header?.reference}
                    maxAccess={!editMode && maxAccess}
                    maxLength='30'
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.reference', '')}
                    error={formik.touched.header?.reference && Boolean(formik.errors.header?.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='header.date'
                    label={labels.date}
                    readOnly={isClosed}
                    value={formik?.values?.header.date}
                    onChange={formik.setFieldValue}
                    required
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('header.date', null)}
                    error={formik?.touched?.header?.date && Boolean(formik?.errors?.header?.date)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='header.siteId'
                    label={labels.site}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values.header}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    readOnly={isClosed}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.siteId', newValue?.recordId || null)
                    }}
                    required
                    error={formik?.touched?.header?.siteId && Boolean(formik.errors?.header?.siteId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.ProductionLine.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dtId=${formik.values.header.dtId}`}
                    values={formik.values.header}
                    name='header.productionLineId'
                    label={labels.productionLine}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    displayFieldWidth={1}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    required
                    readOnly={isClosed}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.productionLineId', newValue?.recordId || null)
                    }}
                    error={formik?.touched?.header?.productionLineId && formik?.errors?.header?.productionLineId}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.ProductionStandard.qry}
                    values={formik.values.header}
                    name='header.productionStandardId'
                    label={labels.productionStandard}
                    valueField='recordId'
                    displayField='reference'
                    required
                    readOnly={isClosed}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.productionStandardId', newValue?.recordId || '')
                    }}
                    error={
                      formik?.touched?.header?.productionStandardId &&
                      Boolean(formik?.errors?.header?.productionStandardId)
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.ProductionClass.qry}
                    values={formik.values.header}
                    name='header.productionClassId'
                    label={labels.productionClass}
                    valueField='recordId'
                    readOnly={isClosed}
                    displayField='name'
                    maxAccess={maxAccess}
                    required
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.productionClassId', newValue?.recordId || '')
                    }}
                    error={
                      formik?.touched?.header?.productionClassId && Boolean(formik?.errors?.header?.productionClassId)
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.weight'
                    maxAccess={maxAccess}
                    label={labels.sampleWgt}
                    value={formik.values.header.weight}
                    maxLength={10}
                    decimalScale={2}
                    readOnly={isClosed}
                    required
                    onChange={e => formik.setFieldValue('header.weight', e.target.value)}
                    onClear={() => {
                      formik.setFieldValue('header.weight', null)
                    }}
                    error={formik?.touched?.header?.weight && Boolean(formik?.errors?.header?.weight)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.DesignFamily.qry}
                    name='header.designFamilyId'
                    label={labels.familyGroup}
                    valueField='recordId'
                    displayField={'name'}
                    values={formik.values.header}
                    readOnly={isClosed}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.designFamilyId', newValue?.recordId || null)
                    }}
                    error={formik?.touched?.header?.designFamilyId && Boolean(formik?.errors?.header?.designFamilyId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={ManufacturingRepository.MFJobOrder.snapshot3}
                    parameters={{ _status: 1 }}
                    valueField='reference'
                    displayField='reference'
                    secondDisplayField={false}
                    name='header.jobId'
                    label={labels.jobOrder}
                    readOnly={isClosed}
                    formObject={formik.values.header}
                    form={formik}
                    required
                    valueShow='jobRef'
                    maxAccess={access}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'itemName', value: 'Item Name' },
                      { key: 'description', value: 'Description' }
                    ]}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.jobRef', newValue?.reference || '')
                      formik.setFieldValue('header.jobId', newValue?.recordId || null)
                    }}
                    errorCheck={'header.jobId'}
                  />
                </Grid>

                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={InventoryRepository.Item.snapshot}
                    name='header.itemId'
                    label={labels.sku}
                    valueField='sku'
                    displayFieldWidth={2}
                    displayField='name'
                    readOnly={isClosed}
                    valueShow='sku'
                    secondValueShow='itemName'
                    formObject={formik.values.header}
                    form={formik}
                    columnsInDropDown={[
                      { key: 'sku', value: 'SKU' },
                      { key: 'name', value: 'Name' }
                    ]}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.itemId', newValue?.recordId || null)
                      formik.setFieldValue('header.itemName', newValue?.name || '')
                      formik.setFieldValue('header.sku', newValue?.sku || '')
                    }}
                    errorCheck={'header.itemId'}
                    maxAccess={maxAccess}
                  />
                </Grid>

                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={ProductModelingRepository.ThreeDDesign.snapshot}
                    valueField='reference'
                    displayField='reference'
                    secondDisplayField={false}
                    name='header.threeDDId'
                    label={labels.threeDD}
                    formObject={formik.values.header}
                    form={formik}
                    required
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'date', value: 'Date', type: 'date' },
                      { key: 'designerRef', value: 'Designer' }
                    ]}
                    valueShow='threeDDRef'
                    maxAccess={maxAccess}
                    readOnly={isClosed}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.threeDDRef', newValue?.reference || '')
                      formik.setFieldValue('header.threeDDId', newValue?.recordId || null)
                    }}
                    errorCheck={'header.threeDDId'}
                  />
                </Grid>

                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Collections.qry}
                    name='header.collectionId'
                    label={labels.collection}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    required
                    maxAccess={maxAccess}
                    readOnly={isClosed}
                    values={formik.values.header}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.collectionId', newValue?.recordId || null)
                    }}
                    error={formik?.touched?.header?.collectionId && Boolean(formik?.errors?.header?.collectionId)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.DesignGroup.qry}
                    name='header.designGroupId'
                    label={labels.designGroup}
                    valueField='recordId'
                    displayField={'name'}
                    values={formik.values.header}
                    readOnly={isClosed}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.designGroupId', newValue?.recordId || null)
                    }}
                    error={formik?.touched?.header?.designGroupId && Boolean(formik?.errors?.header?.designGroupId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <ImageUpload
                ref={imageUploadRef}
                resourceId={ResourceIds.Samples}
                seqNo={0}
                disabled={isClosed}
                recordId={recordId}
                width={250}
                height={200}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('rows', value)}
            value={formik.values.rows}
            error={formik.errors.rows}
            name='rows'
            maxAccess={maxAccess}
            columns={columns}
            allowAddNewLine={!isClosed}
            allowDelete={!isClosed}
            disabled={isClosed}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <CustomTextField
                name='header.statusName'
                label={labels.statusName}
                value={formik.values.header.statusName}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={3}>
              <CustomTextArea
                name='header.notes'
                label={labels.notes}
                value={formik?.values.header?.notes}
                rows={2.5}
                readOnly={isClosed}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('header.notes', e.target.value)}
                onClear={() => formik.setFieldValue('header.notes', '')}
                error={formik?.touched?.header?.notes && Boolean(formik?.errors?.header?.notes)}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

SamplesForm.width = 1200
SamplesForm.height = 680