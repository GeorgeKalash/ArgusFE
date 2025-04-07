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

export default function MetalTrxFinancialForm({ labels, access, recordId, functionId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)
  const [metal, setMetal] = useState({})
  const [allMetals, setAllMetals] = useState([])
  const filteredItems = useRef()

  const getEndpoint = {
    [SystemFunction.MetalReceiptVoucher]: FinancialRepository.MetalReceiptVoucher.set2,
    [SystemFunction.MetalPaymentVoucher]: FinancialRepository.MetalPaymentVoucher.set2
  }

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: functionId,
    access: access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.MetalTrx.page
  })

  const plantId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'plantId')?.value)
  const siteId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'siteId')?.value)

  const { formik } = useForm({
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      accountId: null,
      batchId: null,
      collectorId: null,
      contactId: null,
      creditAmount: null,
      date: new Date(),
      description: '',
      dtId: null,
      functionId: functionId,
      isVerified: null,
      plantId,
      qty: null,
      recordId: null,
      reference: '',
      releaseStatus: null,
      siteId,
      status: 1,
      items: [
        {
          id: 1,
          baseMetalQty: null,
          creditAmount: null,
          stdPurity: null,
          itemId: null,
          sku: '',
          itemName: '',
          metalId: null,
          purity: null,
          qty: null,
          seqNo: 1,
          purityFromItem: false,
          metalValue: null,
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
      siteId: yup.string().required(),
      accountId: yup.string().required(),
      items: yup
        .array()
        .of(
          yup.object().shape({
            metalId: yup.string().required(),
            qty: yup.number().required().typeError().positive(),
            purity: yup.number().required().typeError().positive(),
            sku: yup.string().required(),
            creditAmount: yup.string().required()
          })
        )
        .required()
    }),
    onSubmit: async obj => {
      const { items: originalItems, ...header } = obj

      const updatedHeader = {
        ...header,
        qty: originalItems?.reduce((sum, item) => sum + item.qty, 0) || 0
      }

      const items = originalItems?.map(item => ({
        trxId: obj?.recordId || 0,
        seqNo: item.id,
        metalId: item.metalId,
        itemId: item.itemId,
        qty: item.qty,
        creditAmount: item.creditAmount,
        purity: item.purity / 1000,
        totalCredit: item.totalCredit,
        trackBy: item.trackBy || 0,
        baseSalesMetalValue: item.baseSalesMetalValue
      }))

      const payload = {
        header: updatedHeader,
        items
      }

      const response = await postRequest({
        extension: getEndpoint[formik.values.functionId],
        record: JSON.stringify(payload)
      })
      const actionMessage = editMode ? platformLabels.Edited : platformLabels.Added
      toast.success(actionMessage)
      refetchForm(response?.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values?.recordId
  const isPosted = formik.values.status === 3
  const calculateTotal = key => formik.values.items.reduce((sum, item) => sum + (parseFloat(item[key]) || 0), 0)
  const totalQty = calculateTotal('qty')
  const totalLabor = calculateTotal('totalCredit')
  const totalMetal = calculateTotal('metalValue')

  async function getData(recordId) {
    if (!recordId || !functionId) return

    const response = await getRequest({
      extension: FinancialRepository.MetalTrx.get,
      parameters: `_recordId=${recordId}&_functionId=${functionId}`
    })

    return {
      ...response?.record,
      date: formatDateFromApi(response?.record.date)
    }
  }

  const onPost = async () => {
    const { items, ...restValues } = formik.values

    await postRequest({
      extension: FinancialRepository.MetalTrx.post,
      record: JSON.stringify({
        ...restValues,
        qty: totalQty,
        creditAmount: totalLabor
      })
    })

    toast.success(platformLabels.Posted)
    invalidate()
    window.close()
  }

  const onUnpost = async () => {
    const { items, ...restValues } = formik.values

    const res = await postRequest({
      extension: FinancialRepository.MetalTrx.unpost,
      record: JSON.stringify({
        ...restValues,
        qty: totalQty,
        creditAmount: totalLabor
      })
    })

    toast.success(platformLabels.Unposted)
    refetchForm(res?.recordId)
    invalidate()
  }

  async function setDefaults(dtId) {
    if (dtId) {
      const res = await getRequest({
        extension: FinancialRepository.FIDocTypeDefaults.get,
        parameters: `_dtId=${dtId}`
      })

      const siteIdValue = res.record?.siteId
      const plantIdValue = res.record?.plantId

      if (siteIdValue && plantIdValue) {
        formik.setFieldValue('siteId', siteIdValue)
        formik.setFieldValue('plantId', plantIdValue)
      }
    }
  }

  const getResourceId = functionId => {
    switch (functionId) {
      case SystemFunction.MetalReceiptVoucher:
        return ResourceIds.MetalReceiptVoucher
      case SystemFunction.MetalPaymentVoucher:
        return ResourceIds.MetalPaymentVoucher
      default:
        return
    }
  }

  function getFilteredMetal(metalId) {
    filteredItems.current = metalId
      ? allMetals.filter(metal => {
          return metal.metalId === metalId
        })
      : []
  }
  async function getAllMetals() {
    const res = await getRequest({
      extension: InventoryRepository.Scrap.qry,
      parameters: '_metalId=0'
    })
    setAllMetals(res?.list)
  }
  async function refetchForm(recordId, metalInfo) {
    const headerRes = await getData(recordId)

    const itemsRes = await getRequest({
      extension: FinancialRepository.MetalReceiptVoucher.qry,
      parameters: `_trxId=${recordId}&_functionId=${functionId}`
    })

    const modifiedList = itemsRes?.list?.map((item, index) => ({
      ...item,
      purity: item.purity && item.purity <= 1 ? item.purity * 1000 : item.purity,
      metalValue:
        metalInfo?.purity || metal.purity
          ? ((item.qty * item.purity) / (metalInfo?.purity || metal.purity)).toFixed(2)
          : null,
      totalCredit: item?.totalCredit || 0,
      creditAmount: item?.creditAmount || 0,
      id: index + 1,
      seqNo: index + 1
    }))
    formik.setValues({
      ...headerRes,
      items: modifiedList?.length > 0 ? modifiedList : formik.values.items
    })
  }

  const columns = [
    {
      component: 'resourcecombobox',
      label: labels.metal,
      name: 'metalId',
      props: {
        endpointId: InventoryRepository.Metals.qry,
        valueField: 'recordId',
        displayField: 'reference',
        displayFieldWidth: 1.5,
        mapping: [
          { from: 'reference', to: 'metalRef' },
          { from: 'recordId', to: 'metalId' },
          { from: 'purity', to: 'purity' },
          { from: 'purity', to: 'stdPurity' }
        ]
      },
      propsReducer({ row, props }) {
        return { ...props, readOnly: !!row.itemId }
      },
      onChange: async ({ row: { update, newRow } }) => {
        getFilteredMetal(newRow?.metalId)
        if (newRow.purity)
          update({ purity: newRow.purity * 1000, stdPurity: newRow.stdPurity * 1000, purityFromItem: true })
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.sku,
      name: 'sku',
      props: {
        store: filteredItems?.current,
        valueField: 'itemId',
        displayField: 'sku',
        mapping: [
          { from: 'itemName', to: 'itemName' },
          { from: 'itemId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'laborValuePerGram', to: 'creditAmount' }
        ],
        displayFieldWidth: 2
      },
      propsReducer({ row, props }) {
        return { ...props, store: filteredItems?.current }
      },
      onChange: async ({ row: { update, newRow } }) => {
        const purityValue = newRow.purity || newRow.stdPurity

        if (!newRow?.itemId) return

        const res = await getRequest({
          extension: InventoryRepository.Items.get,
          parameters: `_recordId=${newRow?.itemId}`
        })

        if (!purityValue) return
        const totalCredit = newRow.qty * newRow.creditAmount * (purityValue / newRow.stdPurity)
        update({
          purity: purityValue === newRow.stdPurity ? purityValue : purityValue * 1000,
          totalCredit,
          trackBy: res.record.trackBy,
          purityFromItem: true
        })
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
      name: 'purity',
      label: labels.purity,
      defaultValue: 0,
      onChange: ({ row: { update, newRow } }) => {
        const baseSalesMetalValue = (newRow.qty * newRow.purity) / (metal.purity * 1000)
        update({ purityFromItem: false })

        const totalCredit = newRow.purityFromItem
          ? newRow.qty * newRow.creditAmount
          : newRow.qty * newRow.creditAmount * (newRow.purity / newRow.stdPurity)

        update({ baseSalesMetalValue, totalCredit: totalCredit.toFixed(2) })
        if (metal) {
          const metalValue = baseSalesMetalValue.toFixed(2)
          update({ metalValue: metalValue })
        }
      },
      propsReducer({ row, props }) {
        return { ...props, readOnly: row.trackBy != 2 }
      }
    },
    {
      component: 'numberfield',
      name: 'qty',
      label: labels.qty,
      props: { allowNegative: false },
      defaultValue: 0,
      onChange: ({ row: { update, newRow } }) => {
        const baseSalesMetalValue = (newRow.qty * newRow.purity) / (metal.purity * 1000)

        const totalCredit = newRow.purityFromItem
          ? newRow.qty * newRow.creditAmount
          : newRow.qty * newRow.creditAmount * (newRow.purity / newRow.stdPurity)
        update({ baseSalesMetalValue, totalCredit: totalCredit.toFixed(2) })
        if (metal) {
          const metalValue = ((newRow.qty * newRow.purity) / (metal.purity * 1000)).toFixed(2)
          update({ metalValue: metalValue })
        }
      }
    },
    {
      component: 'numberfield',
      name: 'creditAmount',
      label: labels.labor,
      defaultValue: 0,
      props: { allowNegative: false, readOnly: true }
    },
    {
      component: 'numberfield',
      name: 'totalCredit',
      label: labels.totalLabor,
      defaultValue: 0,
      props: { allowNegative: false, readOnly: true }
    }
  ]

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
    },
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      disabled: !editMode
    }
  ]

  if (metal.reference) {
    const qtyIndex = columns.findIndex(col => col.name === 'qty')
    if (qtyIndex !== -1) {
      columns.splice(qtyIndex + 1, 0, {
        component: 'numberfield',
        label: metal.reference,
        name: 'metalValue',
        props: {
          decimalScale: 2,
          readOnly: true
        }
      })
    }
  }
  useEffect(() => {
    ;(async function () {
      let metalInfo
      await getAllMetals()
      const filteredItem = defaultsData?.list?.find(obj => obj.key === 'baseSalesMetalId')
      if (parseInt(filteredItem?.value)) {
        const metalRes = await getRequest({
          extension: InventoryRepository.Metals.get,
          parameters: `_recordId=${parseInt(filteredItem?.value)}`
        })
        setMetal(metalRes.record)
        metalInfo = metalRes.record
      }
      if (recordId) refetchForm(recordId, metalInfo)
    })()
  }, [])

  useEffect(() => {
    setDefaults(formik?.values?.dtId)
  }, [formik.values.dtId])

  return (
    <FormShell
      resourceId={getResourceId(parseInt(formik.values.functionId))}
      form={formik}
      maxAccess={maxAccess}
      actions={actions}
      previewReport={editMode}
      editMode={editMode}
      functionId={formik.values.functionId}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${functionId}`}
                filter={!editMode ? item => item.activeStatus === 1 : undefined}
                name='dtId'
                label={labels.docType}
                readOnly={editMode}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                required
                onChange={async (event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId)
                  changeDT(newValue)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                maxAccess={!editMode && maxAccess}
              />
            </Grid>
            <Grid item xs={4}>
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
                  formik.setFieldValue('plantId', newValue?.recordId)
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={formik.values?.accountId && FinancialRepository.Contact.qry}
                parameters={formik.values?.accountId && `_accountId=${formik.values?.accountId}`}
                name='contactId'
                readOnly={isPosted}
                label={labels.contact}
                valueField='recordId'
                displayField={'name'}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('contactId', newValue?.recordId)
                }}
                error={formik.touched.contactId && Boolean(formik.errors.contactId)}
              />
            </Grid>
            <Grid item xs={4}>
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
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='siteId'
                label={labels.site}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                readOnly={isPosted}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('siteId', newValue?.recordId)
                }}
                required
                error={formik.touched.siteId && Boolean(formik.errors.siteId)}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={LogisticsRepository.LoCollector.qry}
                name='collectorId'
                label={labels.collector}
                valueField='recordId'
                displayField='reference'
                values={formik.values}
                readOnly={isPosted}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('collectorId', newValue?.recordId)
                }}
                error={formik.touched.collectorId && Boolean(formik.errors.collectorId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomDatePicker
                name='date'
                required
                readOnly={isPosted}
                label={labels.date}
                value={formik.values.date}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceLookup
                endpointId={FinancialRepository.Account.snapshot}
                name='accountId'
                label={labels.accountRef}
                valueField='reference'
                displayField='name'
                valueShow='accountRef'
                secondValueShow='accountName'
                required
                errorCheck={'accountId'}
                form={formik}
                secondDisplayField={true}
                firstValue={formik.values.accountRef}
                secondValue={formik.values.accountName}
                displayFieldWidth={3}
                maxAccess={maxAccess}
                readOnly={isPosted}
                onChange={(event, newValue) => {
                  formik.setFieldValue('accountId', newValue?.recordId)
                  formik.setFieldValue('accountRef', newValue?.reference)
                  formik.setFieldValue('accountName', newValue?.name)
                }}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values?.items}
            error={formik.errors?.items}
            name='items'
            columns={columns}
            maxAccess={maxAccess}
            disabled={isPosted}
            allowDelete={!isPosted}
            onSelectionChange={(row, update, field) => {
              if (field == 'sku') getFilteredMetal(row?.metalId)
            }}
          />
        </Grow>
        <Fixed>
          <Grid container justifyContent='space-between'>
            <Grid item xs={5}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    neverPopulate
                    endpointId={FinancialRepository.DescriptionTemplate.qry}
                    name='templateId'
                    label={labels.descriptionTemplate}
                    valueField='recordId'
                    displayField='name'
                    readOnly={isPosted}
                    onChange={(event, newValue) => {
                      if (newValue?.name)
                        formik.setFieldValue('description', formik.values.description + newValue?.name + '\n')
                    }}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='description'
                    type='text'
                    label={labels.description}
                    value={formik.values.description}
                    rows={3}
                    readOnly={isPosted}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('description', e.target.value)}
                    onClear={() => formik.setFieldValue('description', '')}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={5}>
              <Grid container spacing={2}>
                <Grid item xs={7}>
                  <CustomNumberField label={labels.totalQty} value={totalQty} decimalScale={2} readOnly />
                </Grid>
                <Grid item xs={7}>
                  <CustomNumberField label={labels.totalLabor} value={totalLabor} decimalScale={2} readOnly />
                </Grid>
                {metal?.reference && (
                  <Grid item xs={7}>
                    <CustomNumberField
                      label={`${labels.total} ${metal.reference}`}
                      value={totalMetal}
                      decimalScale={2}
                      readOnly
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
