import { Grid } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi } from 'src/lib/date-helper'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { ControlContext } from 'src/providers/ControlContext'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { LogisticsRepository } from 'src/repositories/LogisticsRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { getStorageData } from 'src/storage/storage'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { FoundryRepository } from 'src/repositories/FoundryRepository'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { DataSets } from 'src/resources/DataSets'

export default function FoWaxesForm({ labels, access, recordId, window }) {
  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.Wax,
    access: access,
    enabled: !recordId
  })
  const userData = getStorageData('userData')

  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)
  const [baseMetalId, setBaseMetalId] = useState(null)
  const [metal, setMetal] = useState({})

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.MetalTrx.page
  })

  const getEndpoint = functionId => {
    const id = Number(functionId)
    switch (id) {
      case SystemFunction.MetalReceiptVoucher:
        return FinancialRepository.MetalReceiptVoucher.set2
      case SystemFunction.MetalPaymentVoucher:
        return FinancialRepository.MetalPaymentVoucher.set2
      default:
        return null
    }
  }

  const getData = async (recordId, functionId) => {
    if (!recordId || !functionId) return null

    const response = await getRequest({
      extension: FinancialRepository.MetalTrx.get,
      parameters: `_recordId=${recordId}&_functionId=${functionId}`
    })
    formik.setFieldValue('reference', response?.record.reference)

    return {
      ...response?.record,
      date: formatDateFromApi(response?.record.date)
    }
  }

  const plantId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'plantId')?.value)
  const siteId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'siteId')?.value)

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      header: {
        dtId: documentType?.dtId,
        reference: '',
        mouldRef: '',
        date: new Date(),
        plantId: null,
        lineId: null,
        metalId: null,
        metalColorId: null,
        workCenterId: null,
        factor: null,
        grossWgt: null,
        rmWgt: null,
        mouldWgt: null,
        netWgt: null,
        suggestedWgt: null,
        status: 1,
        wip: 1
      },
      items: [
        {
          id: 1,
          jobId: null,
          waxId: null,
          pieces: 0,
          jobPcs: 0,
          classRef: '',
          designRef: '',
          standardRef: '',
          standardId: null,
          classId: null,
          sku: '',
          itemName: '',
          rmWgt: null,

          metalId: null,
          metalRef: '',
          purity: null,
          qty: null,
          seqNo: 1,
          stdPurity: null,
          totalCredit: null,
          trackBy: null,
          trxId: recordId || 0
        }
      ]
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required(),
      mouldId: yup.string().required(),
      lineId: yup.string().required(),
      metalId: yup.string().required(),
      metalColorId: yup.string().required(),
      factor: yup.string().required(),
      grossWgt: yup.string().required(),
      rmWgt: yup.string().required(),
      mouldWgt: yup.string().required(),
      netWgt: yup.string().required(),
      suggestedWgt: yup.string().required(),

      items: yup
        .array()
        .of(
          yup.object().shape({
            jobId: yup.string().required()
          })
        )
        .required(' ')
    }),

    onSubmit: async obj => {
      // const { items: originalItems, ...header } = obj
      // const totalQty = originalItems?.reduce((sum, item) => sum + item.qty, 0) || 0
      // const updatedHeader = {
      //   ...header,
      //   qty: totalQty
      // }
      // const items = originalItems?.map((item, index) => ({
      //   trxId: obj.recordId || 0,
      //   seqNo: item.id,
      //   metalId: item.metalId,
      //   itemId: item.itemId,
      //   qty: item.qty,
      //   creditAmount: item.creditAmount,
      //   purity: item.purity / 1000,
      //   totalCredit: item.totalCredit,
      //   trackBy: item.trackBy || 0
      // }))
      // const payload = {
      //   header: updatedHeader,
      //   items
      // }
      // const response = await postRequest({
      //   extension: getEndpoint(formik.values.functionId),
      //   record: JSON.stringify(payload)
      // })
      // if (!obj.recordId) {
      //   toast.success(platformLabels.Added)
      //   formik.setValues({
      //     ...obj,
      //     recordId: response.recordId
      //   })
      // } else {
      //   toast.success(platformLabels.Edited)
      // }
      // getData(response.recordId, functionId)
      // invalidate()
    }
  })

  const onPost = async () => {
    const { items, ...restValues } = formik.values

    const header = JSON.stringify({
      ...restValues,
      qty: totalQty,
      creditAmount: totalLabor,
      recordId: formik.values.recordId
    })

    await postRequest({
      extension: FinancialRepository.MetalTrx.post,
      record: header
    })

    toast.success(platformLabels.Posted)
    window.close()
    invalidate()
  }
  const editMode = !!formik.values?.recordId || !!recordId

  useEffect(() => {
    if (baseMetalId) {
      getRequest({
        extension: InventoryRepository.Metals.get,
        parameters: `_recordId=${baseMetalId}`
      }).then(res => {
        setMetal(res.record)
      })
    }
  }, [baseMetalId])

  const parseNumber = value => {
    const number = parseFloat(value)

    return isNaN(number) ? 0 : number
  }

  const totalQty = formik.values.items.reduce((sum, item) => sum + parseNumber(item.qty), 0)
  const totalLabor = formik.values.items.reduce((sum, item) => sum + parseNumber(item.totalCredit), 0)
  const totalMetal = formik.values.items.reduce((sum, item) => sum + parseNumber(item.metalValue), 0)

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.jobOrder,
      name: 'jobRef',
      flex: 2,
      props: {
        endpointId: ManufacturingRepository.MFJobOrder.snapshot,
        displayField: 'reference',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'jobId' },
          { from: 'reference', to: 'jobRef' },
          { from: 'itemName', to: 'itemName' },
          { from: 'itemName', to: 'itemName' },
          { from: 'itemId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'jobPcs', to: 'pcs' },
          { from: 'routingSeqNo', to: 'routingSeqNo' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'designRef', value: 'Design' },
          { key: 'itemName', value: 'Item Name' }
        ],
        displayFieldWidth: 2
      },
      async onChange({ row: { update, newRow } }) {
        // const design = await getDesign(newRow.itemId)
        // if(!routingSeqNo) return;
        // const jobRouting = await getItem(newRow.jobId, newRow.routingSeqNo)
        // update({
        //   volume: parseFloat(itemPhysProp?.volume) || 0,
        //   weight: parseFloat(itemPhysProp?.weight || 0).toFixed(2),
        //   vatAmount: parseFloat(itemInfo?.vatPct || 0).toFixed(2),
        //   basePrice: parseFloat(ItemConvertPrice?.basePrice || 0).toFixed(5),
        //   unitPrice: parseFloat(ItemConvertPrice?.unitPrice || 0).toFixed(3),
        //   upo: parseFloat(ItemConvertPrice?.upo || 0).toFixed(2),
        //   priceType: ItemConvertPrice?.priceType || 1,
        //   mdAmount: formik.values.maxDiscount ? parseFloat(formik.values.maxDiscount).toFixed(2) : 0,
        //   qty: 0,
        //   msId: itemInfo?.msId,
        //   muRef: filteredMeasurements?.[0]?.reference,
        //   muId: filteredMeasurements?.[0]?.recordId,
        //   extendedPrice: parseFloat('0').toFixed(2),
        //   mdValue: 0,
        //   taxId: rowTax,
        //   taxDetails: formik.values.isVattable ? rowTaxDetails : null,
        //   mdType: 1,
        //   siteId: formik?.values?.siteId,
        //   siteRef: await getSiteRef(formik?.values?.siteId),
        //   saTrx: true,
        //   taxDetailsButton: true
        // })
        // formik.setFieldValue('mdAmount', formik.values.currentDiscount ? formik.values.currentDiscount : 0)
      }
    },
    {
      component: 'textfield',
      label: labels.sku,
      name: 'sku',
      props: {
        readOnly: true
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
      component: 'textfield',
      label: labels.designRef,
      name: 'designRef',
      props: {
        readOnly: true
      }
    },

    {
      component: 'numberfield',
      name: 'rmWgt',
      label: labels.rmWgt,
      props: { readOnly: true },
      defaultValue: 0,
      onChange: ({ row: { update, newRow } }) => {
        // const baseSalesMetalValue = (newRow.qty * newRow.purity) / (App.currentMetalPurity.getValue() * 1000)
        // const totalCredit = newRow.purity
        //   ? newRow.qty * newRow.creditAmount
        //   : newRow.qty * newRow.creditAmount * (newRow.purity / newRow.stdPurity)
        // update({ baseSalesMetalValue, totalCredit })
      }
    },
    {
      component: 'numberfield',
      name: 'pieces',
      label: labels.pieces,
      props: { allowNegative: false },
      defaultValue: 0,
      onChange: ({ row: { update, newRow } }) => {
        // const totalCredit = newRow.purity
        //   ? newRow.qty * newRow.creditAmount
        //   : newRow.qty * newRow.creditAmount * (newRow.purity / newRow.stdPurity)
        // update({ totalCredit })
        // if (metal && Object.keys(metal).length > 0) {
        //   const metalValue = Math.round(((newRow.qty * newRow.purity) / (metal.purity * 1000)) * 100) / 100
        //   update({ metalValue: metalValue })
        // }
      }
    }
  ]

  const onUnpost = async () => {
    const { items, ...restValues } = formik.values

    const res = await postRequest({
      extension: FinancialRepository.MetalTrx.unpost,
      record: JSON.stringify(restValues)
    })

    if (res?.recordId) {
      toast.success(platformLabels.Unposted)

      const res2 = await getData(res.recordId, functionId)

      formik.setValues({
        ...res2,
        items: formik.values.items
      })

      invalidate()
    }
  }
  const isPosted = formik.values.status === 3
  const isClosed = formik.values.wip === 2

  const actions = [
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
    },

    {
      key: 'Aging',
      condition: true,
      onClick: 'onClickAging',
      disabled: !editMode
    }
  ]

  return (
    <FormShell form={formik} resourceId={ResourceIds.ProductMaster} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container>
            {/* First Column */}
            <Grid container rowGap={2} xs={4} sx={{ px: 2 }}>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SystemRepository.DocumentType.qry}
                  parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.Wax}`}
                  filter={!editMode ? item => item.activeStatus === 1 : undefined}
                  name='dtId'
                  label={labels.docType}
                  readOnly={editMode}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values}
                  required
                  onChange={async (event, newValue) => {
                    formik.setFieldValue('dtId', newValue?.recordId || '')
                    changeDT(newValue)
                  }}
                  error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                  maxAccess={!editMode && maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='reference'
                  label={labels.reference}
                  value={formik.values.reference}
                  readOnly={editMode || !formik.values.dtId}
                  maxAccess={!editMode && maxAccess}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('reference', '')}
                  error={formik.touched.reference && Boolean(formik.errors.reference)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={FoundryRepository.Mould.qry}
                  name='mouldId'
                  parameters='_params=&_startAt=0&_pageSize=1000'
                  label={labels.mould}
                  valueField='recordId'
                  displayField={'reference'}
                  values={formik.values}
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('mouldId', newValue?.recordId || null)
                  }}
                  error={formik.touched.mouldId && Boolean(formik.errors.mouldId)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomDatePicker
                  name='date'
                  required
                  label={labels.date}
                  value={formik.values.date}
                  onChange={formik.setFieldValue}
                  onClear={() => formik.setFieldValue('date', '')}
                  error={formik.touched.date && Boolean(formik.errors.date)}
                />
              </Grid>
            </Grid>
            {/* Second Column */}
            <Grid container rowGap={2} xs={4} sx={{ px: 2 }}>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SystemRepository.Plant.qry}
                  name='plantId'
                  readOnly={editMode}
                  label={labels.plant}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values}
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('plantId', newValue?.recordId || null)
                  }}
                  error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={ManufacturingRepository.ProductionLine.qry}
                  name='lineId'
                  readOnly={editMode}
                  label={labels.line}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values}
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('lineId', newValue?.recordId || null)
                  }}
                  error={formik.touched.lineId && Boolean(formik.errors.lineId)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={InventoryRepository.Metals.qry}
                  name='metalId'
                  readOnly={editMode}
                  label={labels.metal}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values}
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('metalId', newValue?.recordId || null)
                  }}
                  error={formik.touched.metalId && Boolean(formik.errors.metalId)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={InventoryRepository.MetalColor.qry}
                  name='metalColorId'
                  readOnly={editMode}
                  label={labels.metalColor}
                  valueField='recordId'
                  displayField={'reference'}
                  values={formik.values}
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('metalColorId', newValue?.recordId || null)
                  }}
                  error={formik.touched.metalColorId && Boolean(formik.errors.metalColorId)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='wcName'
                  label={labels.workCenter}
                  value={formik.values.wcName}
                  readOnly
                  maxAccess={maxAccess}
                />
              </Grid>
            </Grid>
            <Grid container rowGap={2} xs={4} sx={{ px: 2 }}>
              <Grid item xs={12}>
                <CustomNumberField name='grossWgt' label={labels.grossWgt} value={formik.values.grossWgt} />
              </Grid>
              <Grid item xs={12}>
                <CustomNumberField name='rmWgt' label={labels.rmWgt} value={formik.values.rmWgt} readOnly />
              </Grid>
              <Grid item xs={12}>
                <CustomNumberField name='mouldWgt' label={labels.mouldWgt} value={formik.values.mouldWgt} />
              </Grid>
              <Grid item xs={12}>
                <CustomNumberField name='netWgt' label={labels.netWgt} value={formik.values.netWgt} readOnly />
              </Grid>
              <Grid item xs={12}>
                <CustomNumberField
                  name='suggestedWgt'
                  label={labels.suggestedWgt}
                  value={formik.values.suggestedWgt}
                  readOnly
                />
              </Grid>
            </Grid>
          </Grid>
        </Grow>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            allowDelete
            name='items'
            columns={columns}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
