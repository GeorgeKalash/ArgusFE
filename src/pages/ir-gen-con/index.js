import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grid } from '@mui/material'
import { ControlContext } from 'src/providers/ControlContext'
import { useResourceQuery } from 'src/hooks/resource'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import FormShell from 'src/components/Shared/FormShell'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { DataGrid } from 'src/components/Shared/DataGrid'
import toast from 'react-hot-toast'
import { useWindow } from 'src/windows'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { IVReplenishementRepository } from 'src/repositories/IVReplenishementRepository'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { useError } from 'src/error'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import WCConsumpForm from '../work-center-consumption/forms/WCConsumpForm'
import { createConditionalSchema } from 'src/lib/validation'

export default function IRGenerateConsumption() {
  const { stack } = useWindow()
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const { platformLabels, userDefaultsData } = useContext(ControlContext)

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.GenerateConsumption
  })
  const siteId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'siteId')?.value)

  const conditions = {
    transferNow: row => row?.transferNow > 0,
    isChecked: row => row?.isChecked
  }

  const { schema } = createConditionalSchema(conditions, true, access, 'items')

  const { formik } = useForm({
    maxAccess: access,
    conditionSchema: ['items'],
    initialValues: {
      dtId: null,
      fromSiteId: null,
      workCenterId: null,
      date: new Date(),
      reference: '',
      wcRef: '',
      wcName: '',
      items: []
    },
    validateOnChange: true,
    validationSchema: yup.object({
      fromSiteId: yup.string().required(),
      workCenterId: yup.string().required(),
      date: yup.date().required(),
      items: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      if (!checkItems()) {
        return
      }

      const updatedItems = obj.items
        .filter(row => row.isChecked)
        ?.map(itemDetails => {
          return {
            requestId: itemDetails.requestId,
            requestSeqNo: itemDetails.seqNo,
            itemId: itemDetails.itemId,
            qty: itemDetails.transferNow,
            muId: itemDetails?.muId || null
          }
        })

      const payload = {
        dtId: obj?.dtId || null,
        fromSiteId: obj?.fromSiteId,
        date: formatDateToApi(obj?.date),
        workCenterId: obj?.workCenterId || null,
        items: updatedItems
      }

      const res = await postRequest({
        extension: IVReplenishementRepository.ConsumptionOfTools.generate,
        record: JSON.stringify(payload)
      })
      toast.success(platformLabels.Generated)
      stack({
        Component: WCConsumpForm,
        props: {
          recordId: res.recordId
        }
      })
      fetchGridData()
    }
  })

  function checkItems() {
    const list = formik.values.items.filter(row => row.isChecked)
    if (list.length < 1) {
      stackError({
        message: labels.checkItemsBeforeAppend
      })

      return false
    }

    return true
  }

  const actions = [
    {
      key: 'GenerateJob',
      condition: true,
      onClick: () => {
        formik.handleSubmit()
      }
    }
  ]

  const columns = [
    {
      component: 'checkbox',
      name: 'isChecked',
      label: ' ',
      flex: 0.3,
      checkAll: {
        visible: false,
        onChange({ checked }) {
          const items = formik.values.items.map(({ isChecked, ...item }) => ({
            ...item,
            isChecked: checked,
            transferNow: checked ? item.qty : 0
          }))

          formik.setFieldValue('items', items)
        }
      },
      async onChange({ row: { update, newRow } }) {
        update({ transferNow: newRow?.isChecked ? newRow?.qty : 0 })
      }
    },
    {
      component: 'textfield',
      label: labels.requestRef,
      name: 'requestRef',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.siteRef,
      name: 'siteRef',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.site,
      name: 'siteName',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'date',
      name: 'requestDate',
      flex: 1,
      label: labels?.date,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.sku,
      name: 'sku',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'onHandGlobal',
      label: labels.onHandGlobal,
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'onHandSite',
      label: labels.onHandSite,
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'qty',
      label: labels.qty,
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'deliveredQty',
      label: labels.delivered,
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'balance',
      label: labels.balance,
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'transferNow',
      label: labels.transferNow,
      flex: 1,
      propsReducer({ row, props }) {
        return { ...props, readOnly: !row?.isChecked }
      },
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        const tfrNow = newRow?.transferNow
        update({
          transferNow: tfrNow >= 0 && tfrNow < newRow?.qty ? tfrNow : newRow?.qty
        })
      }
    }
  ]

  async function fetchGridData(reference) {
    if (!siteId) {
      return
    }

    const res = await getRequest({
      extension: IVReplenishementRepository.OrderItem.open,
      parameters: `_reference=${reference || ''}&_siteId=0&_fromSiteId=${formik.values.fromSiteId || 0}&_workCenterId=${
        formik.values.workCenterId || 0
      }`
    })
    res.list = res?.list?.map((item, index) => {
      return {
        ...item,
        id: index + 1,
        requestDate: item.requestDate ? formatDateFromApi(item.requestDate) : null,
        balance: item.qty || 0 - item.deliveredQty || 0,
        onHandGlobal: parseFloat(item?.onhandGlobal).toFixed(2) || 0,
        onHandSite: parseFloat(item?.onhandSite).toFixed(2) || 0,
        qty: parseFloat(item?.qty).toFixed(2),
        transferNow: 0
      }
    })
    formik.setFieldValue('items', res.list)
  }

  useEffect(() => {
    if (siteId) formik.setFieldValue('fromSiteId', siteId)
  }, [siteId])

  useEffect(() => {
    fetchGridData()
  }, [formik.values.fromSiteId, formik.values.workCenterId])

  return (
    <FormShell
      form={formik}
      isInfo={false}
      isCleared={false}
      isSaved={false}
      actions={actions}
      maxAccess={access}
      resourceId={ResourceIds.GenerateConsumption}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.WorkCenterConsumption}`}
                name='dtId'
                label={labels.documentType}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                displayFieldWidth={1.5}
                maxAccess={access}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId || null)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={2}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik?.values?.date}
                onChange={formik.setFieldValue}
                readOnly
                required
                maxAccess={access}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='fromSiteId'
                readOnly
                required
                label={labels.fromSite}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik.setFieldValue('fromSiteId', newValue?.recordId || null)
                }}
                error={formik.touched.fromSiteId && Boolean(formik.errors.fromSiteId)}
              />
            </Grid>
            <Grid item xs={3}>
              <ResourceLookup
                endpointId={ManufacturingRepository.WorkCenter.snapshot}
                valueField='reference'
                displayField='name'
                name='workCenterId'
                label={labels.workCenter}
                form={formik}
                firstValue={formik.values.wcRef}
                secondValue={formik.values.wcName}
                errorCheck={'workCenterId'}
                required
                maxAccess={access}
                displayFieldWidth={2}
                onChange={(event, newValue) => {
                  if (!siteId) {
                    stackError({
                      message: labels.selectFromSite
                    })

                    return
                  }
                  formik.setFieldValue('wcRef', newValue?.reference || '')
                  formik.setFieldValue('wcName', newValue?.name || '')
                  formik.setFieldValue('workCenterId', newValue?.recordId || null)
                }}
              />
            </Grid>
            <Grid item xs={2}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik?.values?.reference}
                maxAccess={access}
                onBlur={e => {
                  if (!siteId) {
                    stackError({
                      message: labels.selectFromSite
                    })

                    return
                  }

                  const currentValue = e.target.value
                  fetchGridData(currentValue)
                  formik.setFieldValue('reference', currentValue)
                }}
                onClear={() => formik.setFieldValue('reference', '')}
                onChange={formik.handleChange}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values?.items}
            error={formik.errors?.items}
            columns={columns}
            disabled={false}
            allowDelete={false}
            allowAddNewLine={false}
            maxAccess={access}
            name='items'
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
