import { Grid } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { FoundryRepository } from '@argus/repositories/src/repositories/FoundryRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { roundTo } from '@argus/shared-domain/src/lib/numberField-helper'
import { useRecordLock } from '@argus/shared-hooks/src/hooks/useRecordLock'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'

export default function ScrapAdjustmentForm({ labels, access, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const functionId = SystemFunction.ScrapAdjustment
  const [recalc, setRecalc] = useState(false)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId,
    access,
    enabled: !recordId,
    objectName: 'header'
  })

  const invalidate = useInvalidate({
    endpointId: FoundryRepository.ScrapAdjustment.page
  })

  const initialValues = {
    recordId: recordId || null,
    header: {
     recordId: null,
     dtId: null,
     date: new Date(),
     reference: '',
     workCenterId: null,
     siteId: null,
     siteRef: '',
     siteName: '',
     qty: 0,
     status: 1
    },
    items: [
      {
        id: 1,
        sajId: recordId || null,
        seqNo: 1,
        itemId: null,
        qty: 0,
        sku: '',
        itemName: ''        
      }
    ]
  }
  
  const { formik } = useForm({
    behavior: { key: 'header.dtId', value: documentType?.dtId, fieldBehavior: documentType?.reference },
    initialValues,
    maxAccess,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.date().required(),
        workCenterId: yup.number().required(),
        siteRef: yup.string().required(),
        siteName: yup.string().required()
      })
    }),
    onSubmit: async obj => {
      const payload =  {
        header: {
          ...obj.header,
          date: formatDateToApi(obj.header.date),
          qty: totalQty
        },
        items: (obj?.items || []).map((item, index) => ({
          ...item,
          sajId: obj?.recordId || 0,
          seqNo: index + 1
        }))
      }
      const response = await postRequest({
        extension: FoundryRepository.ScrapAdjustment.set2,
        record: JSON.stringify(payload)
      })
      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
      refetchForm(response?.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values?.header.recordId
  const isPosted = formik.values.header.status === 3

  const { releaseLock } = useRecordLock({
    recordId,
    reference: formik?.values?.header?.reference,
    resourceId: ResourceIds.ScrapAdjustment,
    enabled: !!recordId && !isPosted
  })

  const calculateTotal = key => roundTo(formik.values.items.reduce((sum, item) => sum + (Number(item[key]) || 0), 0))
  const totalQty = recalc ? calculateTotal('qty') : formik.values?.header?.qty

  const onPost = async () => {
    await postRequest({
      extension: FoundryRepository.ScrapAdjustment.post,
      record: JSON.stringify({ ...formik.values?.header, date: formatDateToApi(formik.values.header.date) })
    })

    toast.success(platformLabels.Posted)
    await releaseLock()
    invalidate()
    window.close()
  }

  const onUnpost = async () => {
    const res = await postRequest({
      extension: FoundryRepository.ScrapAdjustment.unpost,
      record: JSON.stringify({ ...formik.values?.header, date: formatDateToApi(formik.values.header.date) })
    })

    toast.success(platformLabels.Unposted)
    refetchForm(res?.recordId)
    invalidate()
  }

  async function refetchForm (recordId) {
    const { record } = await getRequest({
      extension: FoundryRepository.ScrapAdjustment.get2,
      parameters: `_recordId=${recordId}`
    })

    if (!record) {
      formik.setValues({ ...initialValues })

      return
    }

   const itemsList = await Promise.all(
    (record?.items || []).map(async (item, index) => {
      return {...item, id: index + 1}
    })
   )

    formik.resetForm({
      values: {
        recordId: record?.header?.recordId,
        header: {...(record?.header || {}), date: formatDateFromApi(record?.header?.date)},
        items: itemsList?.length ? itemsList : initialValues.items
      }
    })
    setRecalc(false)
  }

  async function loadScrap () {
    const res = await getRequest({
      extension: FoundryRepository.Scrap.qry,
      parameters: `_metalId=0&_metalColorId=0`
    })
    formik.setFieldValue('items', res?.list?.length ? res.list.map((item, index) => {
        return { ...item, id: index++, itemId: item?.scrapItemId, qty: 0 }
    }) : initialValues.items)
  }

  const columns = [
    {
      component: 'textfield',
      label: labels.sku,
      name: 'sku',
      props: {
        readOnly: true
      },
      flex: 2
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      props: {
        readOnly: true
      },
      flex: 3
    },
    {
      component: 'numberfield',
      name: 'qty',
      label: labels.qty,
      updateOn: 'blur',
      flex: 1.5,
      props: { maxLength: 12 },
      onChange: async ({ row: { update, newRow } }) => {
       setRecalc(true)
       update({ qty: newRow?.qty || 0 })
      }
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
    }
  ]

  useEffect(() => {
    if (recordId) refetchForm(recordId)
    else loadScrap()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.ScrapAdjustment}
      form={formik}
      maxAccess={maxAccess}
      actions={actions}
      editMode={editMode}
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
                    parameters={`_dgId=${functionId}&_startAt=0&_pageSize=1000`}
                    filter={!editMode ? item => item.activeStatus === 1 : undefined}
                    name='header.dtId'
                    label={labels.docType}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values.header}
                    onChange={(_, newValue) => {
                      changeDT(newValue)
                      formik.setFieldValue('header.dtId', newValue?.recordId || null)
                    }}
                    error={formik.touched.header?.dtId && Boolean(formik.errors.header?.dtId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='header.reference'
                    label={labels.reference}
                    value={formik.values.header.reference}
                    readOnly={editMode}
                    maxAccess={!editMode && maxAccess}
                    maxLength='15'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.reference', '')}
                    error={formik.touched.header?.reference && Boolean(formik.errors.header?.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='header.date'
                    required
                    readOnly={isPosted}
                    label={labels.date}
                    value={formik.values.header.date}
                    onChange={formik.setFieldValue}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('header.date', null)}
                    error={formik.touched.header?.date && Boolean(formik.errors.header?.date)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.WorkCenter.qry}
                    name='header.workCenterId'
                    label={labels.workCenter}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values.header}
                    required
                    readOnly={isPosted}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                     formik.setFieldValue('header.siteId', newValue?.siteId || null)
                     formik.setFieldValue('header.siteRef', newValue?.siteRef || '')
                     formik.setFieldValue('header.siteName', newValue?.siteName || '')
                     formik.setFieldValue('header.workCenterId', newValue?.recordId || null)}
                    }
                    error={formik.touched.header?.workCenterId && Boolean(formik.errors.header?.workCenterId)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField
                    name='header.siteRef'
                    label={labels.siteRef}
                    value={formik.values.header.siteRef}
                    readOnly
                    required
                    maxAccess={maxAccess}
                    error={formik.touched.header?.siteRef && Boolean(formik.errors.header?.siteRef)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField
                    name='header.siteName'
                    label={labels.siteName}
                    value={formik.values.header.siteName}
                    readOnly
                    required
                    maxAccess={maxAccess}
                    error={formik.touched.header?.siteName && Boolean(formik.errors.header?.siteName)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    label={labels.qty}
                    value={totalQty}
                    readOnly
                    maxAccess={maxAccess}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={(value, action) => {
              formik.setFieldValue('items', value)
              action === 'delete' && setRecalc(true)
            }}
            value={formik.values?.items}
            error={formik.errors?.items}
            name='items'
            columns={columns}
            initialValues={initialValues?.items?.[0]}
            maxAccess={maxAccess}
            enableFilters
            disabled={isPosted}
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
