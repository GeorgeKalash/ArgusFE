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
  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: functionId,
    access: access,
    enabled: !recordId
  })

  const { platformLabels, defaultsData } = useContext(ControlContext)
  const [baseMetalId, setBaseMetalId] = useState(null)
  const [g22, setG22] = useState({})

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.MetalReceiptVoucher.qry
  })

  const getEndpoint = functionId => {
    const id = Number(functionId)
    switch (id) {
      case SystemFunction.MetalReceiptVoucher:
        return FinancialRepository.MetalReceiptVoucher.set2R
      case SystemFunction.MetalPaymentVoucher:
        return FinancialRepository.MetalReceiptVoucher.set2P
      default:
        return null
    }
  }

  const getData = async (recordId, functionId) => {
    if (!recordId || !functionId) return null

    const response = await getRequest({
      extension: FinancialRepository.MetalReceiptVoucher.get2,
      parameters: `_recordId=${recordId}&_functionId=${functionId}`
    })
    formik.setFieldValue('reference', response?.record.reference)

    return {
      ...response?.record,
      date: formatDateFromApi(response?.record.date)
    }
  }

  const { formik } = useForm({
    initialValues: {
      accountId: null,
      accountName: '',
      totalG22: null,
      totalLabor: null,
      totalQty: null,
      accountRef: '',
      batchId: null,
      collectorId: null,
      contactId: null,
      creditAmount: null,
      date: '',
      description: '',
      dtId: documentType?.dtId,
      dtName: '',
      functionId: functionId,
      functionName: '',
      isVerified: null,
      plantId: null,
      plantName: '',
      plantRef: '',
      qty: null,
      recordId: null,
      reference: '',
      releaseStatus: null,
      siteId: null,
      siteName: '',
      siteRef: '',
      status: 1,
      statusName: '',
      items: [
        {
          id: 1,
          baseMetalQty: null,
          creditAmount: null,
          stdPurity: null,
          itemId: null,
          itemName: '',
          metalId: null,
          metalRef: '',
          purity: null,
          qty: null,
          seqNo: 1,
          sku: '',
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
      items: yup
        .array()
        .of(
          yup.object().shape({
            metalId: yup.string().required(),
            qty: yup.number().required().typeError().positive(),
            purity: yup.number().required().typeError().positive(),
            sku: yup.string().required()
          })
        )
        .required(' ')
    }),

    onSubmit: async obj => {
      const { items: originalItems, ...header } = obj

      const totalQty = originalItems?.reduce((sum, item) => sum + item.qty, 0) || 0

      const updatedHeader = {
        ...header,
        qty: totalQty
      }

      const items = originalItems?.map((item, index) => ({
        trxId: obj.recordId || 0,
        seqNo: item.id,
        metalId: item.metalId,
        itemId: item.itemId,
        qty: item.qty,
        creditAmount: item.creditAmount,
        purity: item.purity / 1000,
        totalCredit: item.totalCredit,
        trackBy: item.trackBy || 0
      }))

      const payload = {
        header: updatedHeader,
        items
      }

      const response = await postRequest({
        extension: getEndpoint(formik.values.functionId),
        record: JSON.stringify(payload)
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
        getData(response.recordId, functionId)
      } else {
        toast.success(platformLabels.Edited)
      }

      invalidate()
    }
  })

  const editMode = !!formik.values?.recordId || !!recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: FinancialRepository.MetalReceiptVoucher.get,
          parameters: `_trxId=${recordId}&_functionId=${functionId}`
        })

        const res2 = await getData(recordId, functionId)

        const modifiedList = res?.list?.map((item, index) => ({
          ...item,
          purity: item.purity && item.purity <= 1 ? item.purity * 1000 : item.purity,
          g22Value: g22.purity ? Math.round(((item.qty * item.purity) / g22.purity) * 100) / 100 : null,

          id: index + 1,
          seqNo: index + 1
        }))

        if (modifiedList?.length > 0) {
          formik.setValues({ items: modifiedList })
        }

        formik.setValues({ ...res2, items: modifiedList || formik.values.items })
      }

      const getDataResult = () => {
        const myObject = {}

        const filteredList = defaultsData?.list?.filter(obj => {
          return obj.key === 'baseSalesMetalId'
        })
        filteredList?.forEach(obj => (myObject[obj.key] = obj.value ? parseInt(obj.value) : null))
        setBaseMetalId(myObject.baseSalesMetalId)
      }
      getDataResult()
    })()
  }, [g22])

  const getResourceId = functionId => {
    switch (functionId) {
      case SystemFunction.MetalReceiptVoucher:
        return ResourceIds.MetalReceiptVoucher
      case SystemFunction.MetalPaymentVoucher:
        return ResourceIds.MetalPaymentVoucher

      default:
        return null
    }
  }
  const [allMetals, setAllMetals] = useState([])
  const filteredCreditCard = useRef()

  function getFilteredMetal(metalId) {
    if (!metalId) return []

    const array = allMetals.filter(metal => {
      return metal.metalId === metalId
    })

    return array
  }

  useEffect(() => {
    getRequest({
      extension: InventoryRepository.Scrap.qry,
      parameters: '_metalId=0'
    }).then(res => {
      setAllMetals(res.list)
    })
  }, [])

  useEffect(() => {
    if (baseMetalId) {
      getRequest({
        extension: InventoryRepository.Metals.get,
        parameters: `_recordId=${baseMetalId}`
      }).then(res => {
        setG22(res.record)
      })
    }
  }, [baseMetalId])

  // useEffect(() => {
  //   if (formik && formik.values && Array.isArray(formik.values.items)) {
  //     const items = formik.values.items

  //     const parseNumber = value => {
  //       const number = parseFloat(value)

  //       return isNaN(number) ? 0 : number
  //     }
  //   }
  // }, [formik.values.items])

  const parseNumber = value => {
    const number = parseFloat(value)

    return isNaN(number) ? 0 : number
  }

  const totalQty = formik.values.items.reduce((sum, item) => sum + parseNumber(item.qty), 0)
  const totalLabor = formik.values.items.reduce((sum, item) => sum + parseNumber(item.totalCredit), 0)
  const totalG22 = formik.values.items.reduce((sum, item) => sum + parseNumber(item.g22Value), 0)

  const columns = [
    {
      component: 'resourcecombobox',
      label: labels.metalId,
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
      onChange: async ({ row: { update, newRow } }) => {
        filteredCreditCard.current = newRow.metalId

        if (newRow.purity) {
          update({ purity: newRow.purity * 1000, stdPurity: newRow.stdPurity * 1000 })
        }
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.sku,
      name: 'sku',
      props: {
        store: getFilteredMetal(filteredCreditCard?.current),
        valueField: 'itemId',
        displayField: 'sku',
        mapping: [
          { from: 'itemName', to: 'itemName' },
          { from: 'itemId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'purity', to: 'purity' },
          { from: 'laborValuePerGram', to: 'creditAmount' }
        ]
      },
      propsReducer({ row, props }) {
        return { ...props, store: getFilteredMetal(filteredCreditCard?.current) }
      },
      onChange: ({ row: { update, newRow } }) => {
        let purityValue = newRow.purity

        if (!purityValue && newRow.stdPurity) {
          purityValue = newRow.stdPurity
        }

        if (purityValue) {
          const totalCredit = newRow.qty * newRow.creditAmount * (purityValue / newRow.stdPurity)

          if (purityValue === newRow.stdPurity) {
            update({ purity: purityValue, totalCredit })
          } else {
            update({ purity: purityValue * 1000, totalCredit })
          }
        }
      }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'itemName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'itemName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'purity',
      label: labels.purity,
      props: { readOnly: true },
      defaultValue: 0,
      onChange: ({ row: { update, newRow } }) => {
        const baseSalesMetalValue = (newRow.qty * newRow.purity) / (App.currentMetalPurity.getValue() * 1000)

        const totalCredit = newRow.purity
          ? newRow.qty * newRow.creditAmount
          : newRow.qty * newRow.creditAmount * (newRow.purity / newRow.stdPurity)

        update({ baseSalesMetalValue, totalCredit })
      }
    },
    {
      component: 'numberfield',
      name: 'qty',
      label: labels.qty,
      props: { allowNegative: false },
      defaultValue: 0,
      onChange: ({ row: { update, newRow } }) => {
        const totalCredit = newRow.purity
          ? newRow.qty * newRow.creditAmount
          : newRow.qty * newRow.creditAmount * (newRow.purity / newRow.stdPurity)
        update({ totalCredit })
        if (g22 && Object.keys(g22).length > 0) {
          const g22Value = Math.round(((newRow.qty * newRow.purity) / (g22.purity * 1000)) * 100) / 100
          update({ g22Value: g22Value })
        }
      }
    },
    {
      component: 'numberfield',
      name: 'creditAmount',
      label: 'labor',
      props: { allowNegative: false, readOnly: true }
    },
    {
      component: 'numberfield',
      name: 'totalCredit',
      label: 'totalLabor',
      props: { allowNegative: false, readOnly: true }
    }
  ]
  if (g22.reference) {
    const qtyIndex = columns.findIndex(col => col.name === 'qty')
    if (qtyIndex !== -1) {
      columns.splice(qtyIndex + 1, 0, {
        component: 'numberfield',
        label: g22.reference,
        name: 'g22Value',
        props: {
          decimalScale: 2,
          readOnly: true
        }
      })
    }
  }

  const onPost = async () => {
    const { items, ...restValues } = formik.values

    const res = await postRequest({
      extension: FinancialRepository.MetalReceiptVoucher.post,
      record: JSON.stringify(restValues)
    })

    toast.success(platformLabels.Posted)
    window.close()
    invalidate()
  }

  const onUnpost = async () => {
    const { items, ...restValues } = formik.values

    const res = await postRequest({
      extension: FinancialRepository.MetalReceiptVoucher.unpost,
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
    <FormShell
      resourceId={getResourceId(parseInt(formik.values.functionId))}
      form={formik}
      maxAccess={maxAccess}
      actions={actions}
      previewReport={editMode}
      editMode={editMode}
      functionId={formik.values.functionId}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={4}>
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
                onChange={async (event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId || '')
                  changeDT(newValue)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                maxAccess={!editMode && maxAccess}
              />
            </Grid>
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                values={formik.values}
                valueField='recordId'
                displayField='reference'
                columnsInDropDown={[
                  { key: 'reference', value: 'Ref.' },
                  { key: 'name', value: 'Name' }
                ]}
                displayFieldWidth={3}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue?.recordId || null)
                  formik.setFieldValue('plantName', newValue?.name || '')
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField
                readOnly={true}
                name='plantName'
                label={labels.plantName}
                value={formik.values.plantName}
              />
            </Grid>
            <Grid item xs={3}>
              <ResourceComboBox
                endpointId={formik.values?.accountId && FinancialRepository.Contact.qry}
                parameters={formik.values?.accountId && `_accountId=${formik.values?.accountId}`}
                name='contactId'
                readOnly={false}
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
                  formik.setFieldValue('contactId', newValue?.recordId || null)
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
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='siteId'
                label={labels.site}
                defaultIndex={0}
                values={formik.values}
                valueField='recordId'
                displayField='reference'
                columnsInDropDown={[
                  { key: 'reference', value: 'Ref.' },
                  { key: 'name', value: 'Name' }
                ]}
                displayFieldWidth={3}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('siteId', newValue?.recordId || null)
                  formik.setFieldValue('siteName', newValue?.name || '')
                }}
                error={formik.touched.siteId && Boolean(formik.errors.siteId)}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField readOnly={true} name='siteName' value={formik.values.siteName} label={labels.siteName} />
            </Grid>
            <Grid item xs={3}>
              <ResourceComboBox
                endpointId={LogisticsRepository.LoCollector.qry}
                name='collectorId'
                label={labels.collector}
                valueField='recordId'
                displayField='reference'
                values={formik.values}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('collectorId', newValue?.recordId || '')
                }}
                error={formik.touched.collectorId && Boolean(formik.errors.collectorId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik.values.date}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('date', '')}
                error={false}
              />
            </Grid>
            <Grid item xs={2}>
              <ResourceLookup
                endpointId={FinancialRepository.Account.snapshot}
                name='accountId'
                label={labels.accountRef}
                valueField='reference'
                displayField='name'
                valueShow='accountRef'
                secondValueShow='accountName'
                secondDisplayField={false}
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('accountId', newValue?.recordId || '')
                  formik.setFieldValue('accountRef', newValue?.reference || '')
                  formik.setFieldValue('accountName', newValue?.name || '')
                }}
                error={formik.touched.accountId && Boolean(formik.errors.accountId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField
                name='accountName'
                value={formik.values.accountName}
                readOnly={true}
                label={labels.accountName}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
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
                    onChange={(event, newValue) => {
                      let description = formik.values.description

                      if (newValue?.name) formik.setFieldValue('description', description + newValue?.name + '\n')
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
                {g22?.reference && (
                  <Grid item xs={7}>
                    <CustomNumberField
                      label={`${labels.total} ${g22.reference}`}
                      value={totalG22}
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
