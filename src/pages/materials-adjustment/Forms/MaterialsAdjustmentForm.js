import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { useWindow } from 'src/windows'
import { SerialsForm } from 'src/components/Shared/SerialsForm'
import { getFormattedNumber } from 'src/lib/numberField-helper'

export default function MaterialsAdjustmentForm({ labels, access, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, userDefaultsData } = useContext(ControlContext)
  const { stack } = useWindow()

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.MaterialAdjustment,
    access: access,
    enabled: !recordId
  })

  const plantId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'plantId')?.value)
  const siteId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'siteId')?.value)

  const initialValues = {
    recordId: recordId,
    dtId: null,
    reference: '',
    plantId,
    siteId,
    description: '',
    date: new Date(),
    status: 1,
    wip: 1,
    rsStatus: '',
    clientId: null,
    clientName: '',
    clientRef: '',
    rows: [
      {
        id: 1,
        itemId: '',
        sku: '',
        itemName: '',
        qty: '',
        totalCost: '',
        totalQty: '',
        muQty: '',
        qtyInBase: '',
        notes: '',
        seqNo: ''
      }
    ],
    serials: []
  }

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.MaterialsAdjustment.page
  })

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      siteId: yup.string().required(),
      date: yup.date().required(),
      rows: yup
        .array()
        .of(
          yup.object().shape({
            sku: yup.string().required(),
            qty: yup.number().required(),
            itemName: yup.string().required()
          })
        )
        .required()
    }),
    onSubmit: async obj => {
      const copy = { ...obj }
      delete copy.rows
      delete copy.serials
      copy.date = formatDateToApi(copy.date)

      const serialsValues = []

      const updatedRows = formik.values.rows.map((adjDetail, index) => {
        const { serials, ...restDetails } = adjDetail
        let muQty = adjDetail.muQty || 1

        if (serials) {
          const updatedSerials = serials.map((serialDetail, idx) => {
            return {
              ...serialDetail,
              seqNo: index + 1,
              srlSeqNo: 0,
              componentSeqNo: 0,
              itemId: adjDetail?.itemId,
              adjustmentId: formik.values.recordId || 0,
              id: idx
            }
          })
          serialsValues.push(...updatedSerials)
        }

        return {
          ...restDetails,
          adjustmentId: formik.values.recordId || 0,
          qtyInBase: muQty * adjDetail.qty,
          seqNo: index + 1
        }
      })

      const resultObject = {
        header: copy,
        items: updatedRows,
        serials: serialsValues,
        lots: []
      }

      const res = await postRequest({
        extension: InventoryRepository.MaterialsAdjustment.set2,
        record: JSON.stringify(resultObject)
      })

      const actionMessage = editMode ? platformLabels.Edited : platformLabels.Added
      if (res?.recordId) {
        await refetchForm(res?.recordId)
        toast.success(actionMessage)
        invalidate()
      }
    }
  })

  const editMode = !!formik.values.recordId
  const isPosted = formik.values.status === 3

  const totalQty = getFormattedNumber(
    formik.values?.rows
      ?.reduce((qtySum, row) => {
        const qtyValue = parseFloat(row.qty) || 0

        return qtySum + qtyValue
      }, 0)
      .toFixed(2)
  )
  async function onPost() {
    await postRequest({
      extension: InventoryRepository.MaterialsAdjustment.post,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values.date)
      })
    })
    window.close()
    invalidate()
  }

  const onUnpost = async () => {
    const res = await postRequest({
      extension: InventoryRepository.MaterialsAdjustment.unpost,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values.date)
      })
    })
    toast.success(platformLabels.Unposted)
    refetchForm(res?.recordId)
    invalidate()
  }

  async function getDTD(dtId) {
    if (dtId) {
      const res = await getRequest({
        extension: InventoryRepository.DocumentTypeDefaults.get,
        parameters: `_dtId=${dtId}`
      })

      formik.setFieldValue('siteId', res?.record?.siteId || siteId)
      formik.setFieldValue('plantId', res?.record?.plantId || plantId)

      return res
    }
  }

  useEffect(() => {
    if (formik.values.dtId && !recordId) getDTD(formik?.values?.dtId)
  }, [formik.values.dtId])

  const onCondition = row => {
    if (row.trackBy === 1) {
      return {
        imgSrc: '/images/TableIcons/imgSerials.png',
        hidden: false
      }
    } else {
      return {
        imgSrc: '',
        hidden: true
      }
    }
  }

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        valueField: 'sku',
        displayField: 'sku',
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' },
          { from: 'trackBy', to: 'trackBy' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 3
      },
      propsReducer({ row, props }) {
        return { ...props, imgSrc: onCondition(row) }
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'qty',
      label: labels.qty,
      props: {
        maxLength: 11,
        decimalScale: 3
      }
    },
    {
      component: 'textfield',
      label: labels.notes,
      name: 'notes'
    },
    {
      component: 'button',
      name: 'serials',
      label: platformLabels.serials,
      props: {
        onCondition
      },
      onClick: (e, row, update, updateRow) => {
        if (row?.trackBy === 1) {
          stack({
            Component: SerialsForm,
            props: {
              labels,
              disabled: isPosted,
              row,
              siteId: row.qty >= 0 ? null : formik?.values?.siteId,
              maxAccess,
              checkForSiteId: row.qty >= 0 ? false : true,
              updateRow
            }
          })
        }
      }
    }
  ]

  async function getSerials(recordId, seqNo) {
    return await getRequest({
      extension: InventoryRepository.MaterialAdjustmentSerial.qry,
      parameters: `_adjustmentId=${recordId}&_seqNo=${seqNo}&_componentSeqNo=${0}`
    })
  }

  async function refetchForm(recordId) {
    const res = await getRequest({
      extension: InventoryRepository.MaterialsAdjustment.get,
      parameters: `_recordId=${recordId}`
    })

    const res2 = await getRequest({
      extension: InventoryRepository.MaterialsAdjustmentDetail.qry,
      parameters: `_filter=&_adjustmentId=${recordId}`
    })

    const updatedAdjustments = await Promise.all(
      res2.list.map(async item => {
        const serials = await getSerials(recordId, item.seqNo)

        return {
          ...item,
          id: item.seqNo,
          serials: serials?.list?.map((serialDetail, index) => {
            return {
              ...serialDetail,
              id: index
            }
          }),
          totalCost: item.unitCost * item.qty
        }
      })
    )

    formik.setValues({
      ...res.record,
      date: formatDateFromApi(res.record.date),
      rows: updatedAdjustments
    })

    return res?.record
  }

  useEffect(() => {
    if (recordId) refetchForm(recordId)
  }, [])

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      onSuccess: onUnpost,
      disabled: !editMode
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.MaterialsAdjustment}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isPosted={isPosted}
      postVisible={true}
      actions={actions}
      previewReport={editMode}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.MaterialAdjustment}`}
                    name='dtId'
                    label={labels.documentType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={isPosted}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values}
                    maxAccess={!editMode && maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('dtId', newValue?.recordId)
                      changeDT(newValue)
                    }}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik?.values?.reference}
                    maxAccess={!editMode && maxAccess}
                    maxLength='30'
                    readOnly={isPosted}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    readOnly={isPosted}
                    value={formik?.values?.date}
                    onChange={formik.setFieldValue}
                    required
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('date', null)}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={SaleRepository.Client.snapshot}
                    valueField='reference'
                    displayField='name'
                    name='clientId'
                    label={labels.client}
                    form={formik}
                    readOnly={isPosted}
                    displayFieldWidth={3}
                    valueShow='clientRef'
                    secondValueShow='clientName'
                    maxAccess={maxAccess}
                    editMode={editMode}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'szName', value: 'Sales Zone' }
                    ]}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('clientId', newValue?.recordId || null)
                      formik.setFieldValue('clientName', newValue?.name || '')
                      formik.setFieldValue('clientRef', newValue?.reference || '')
                    }}
                    errorCheck={'clientId'}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='plantId'
                    label={labels.plant}
                    readOnly={isPosted}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('plantId', newValue?.recordId)
                    }}
                    error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='siteId'
                    readOnly={isPosted}
                    label={labels.site}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('siteId', newValue?.recordId || null)
                    }}
                    error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='description'
                    label={labels.description}
                    value={formik?.values?.description}
                    rows={2.5}
                    readOnly={isPosted}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('description', '')}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                  />
                </Grid>
              </Grid>
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
            allowAddNewLine={!isPosted}
            allowDelete={!isPosted}
            disabled={isPosted}
          />
        </Grow>
        <Fixed>
          <Grid container xs={6}>
            <CustomTextField
              name='totalQty'
              label={labels.totalQty}
              maxAccess={maxAccess}
              value={totalQty}
              maxLength='30'
              readOnly
              error={formik.touched.totalQty && Boolean(formik.errors.totalQty)}
            />
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
