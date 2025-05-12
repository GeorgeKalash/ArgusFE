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
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { getStorageData } from 'src/storage/storage'

export default function JobOrderWizardForm({ labels, access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const userData = getStorageData('userData').userId

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.JobOrderWizard.page
  })

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      recordId,
      header: {
        recordId: null,
        jobId: null,
        avgWeight: 0,
        expectedPcs: 0,
        expectedQty: 0,
        pcs: 0,
        qty: 0,
        sfItemId: null,
        itemId: null,
        date: new Date(),
        status: 1
      },
      rows: [
        {
          id: 1,
          jozId: recordId,
          sku: '',
          itemName: '',
          issued: 0,
          returned: 0,
          consumed: 0,
          seqNo: 1
        }
      ]
    },
    validateOnChange: true,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.date().required(),
        itemId: yup.number().required(),
        sfItemId: yup.number().required(),
        expectedQty: yup.number().required(),
        jobId: yup.number().required()
      }),
      rows: yup
        .array()
        .of(
          yup.object().shape({
            sku: yup.string().required(),
            itemName: yup.string().required(),
            issued: yup.number().required(),
            returned: yup.number().required(),
            consumed: yup.number().required()
          })
        )
        .required()
    }),
    onSubmit: async obj => {
      const data = {
        header: {
          ...obj.header,
          pcs: parseInt(obj.header.pcs),
          date: formatDateToApi(obj.header.date)
        },
        items: formik.values.rows.map((details, index) => {
          return {
            ...details,
            jozId: obj.recordId ?? 0,
            issued: parseInt(details.issued),
            returned: parseInt(details.returned),
            seqNo: index + 1
          }
        })
      }

      const res = await postRequest({
        extension: ManufacturingRepository.JobOrderWizard.set2,
        record: JSON.stringify(data)
      })
      formik.setFieldValue('recordId', res.recordId)
      formik.setFieldValue('header.recordId', res.recordId)

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
      refetchForm(res?.recordId)
    }
  })

  const getDefaultDT = async () => {
    const res = await getRequest({
      extension: SystemRepository.UserFunction.get,
      parameters: `_userId=${userData}&_functionId=${SystemFunction.JobOrderWizard}`
    })
    formik.setFieldValue('header.dtId', res?.record?.dtId)
  }

  const editMode = !!formik.values.recordId
  const isPosted = formik.values.header.status === 3

  async function onPost() {
    const res = await postRequest({
      extension: ManufacturingRepository.JobOrderWizard.post,
      record: JSON.stringify({
        ...formik.values.header,
        date: formatDateToApi(formik.values.header.date)
      })
    })

    if (res?.recordId) {
      toast.success(platformLabels.Posted)
      invalidate()
      refetchForm(res?.recordId)
    }
  }

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      props: {
        endpointId: InventoryRepository.SFSKU.snapshot,
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
        displayFieldWidth: 3
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
      name: 'issued',
      label: labels.issued,
      async onChange({ row: { update, newRow } }) {
        update({
          consumed: newRow.issued - newRow.returned
        })
      }
    },
    {
      component: 'numberfield',
      name: 'returned',
      label: labels.returned,
      async onChange({ row: { update, newRow } }) {
        update({
          consumed: newRow.issued - newRow.returned
        })
      },
      props: {
        maxLength: 9,
        decimalScale: 2,
      }
    },
    {
      component: 'numberfield',
      name: 'consumed',
      label: labels.consumed,
      props: { readOnly: true, maxLength: 9, decimalScale: 2 }
    }
  ]

  const totalIssued = formik.values?.rows?.reduce((issued, row) => {
    const issuedValue = parseFloat(row.issued?.toString().replace(/,/g, '')) || 0

    return issued + issuedValue
  }, 0)

  async function refetchForm(recordId) {
    const res = await getRequest({
      extension: ManufacturingRepository.JobOrderWizard.get2,
      parameters: `_recordId=${recordId}`
    })

    if (res?.record?.header) {
      const modifiedList = res?.record?.items?.map((item, index) => ({
        ...item,
        consumed: item.issued - item.returned,
        id: index + 1
      }))

      formik.setValues({
        recordId: res.record.header.recordId,
        header: {
          ...res.record.header,
          date: formatDateFromApi(res?.record?.header?.date)
        },
        rows: modifiedList
      })

      return res?.record
    }
  }

  const totalReturned = formik.values?.rows?.reduce((returned, row) => {
    const returnedValue = parseFloat(row.returned?.toString().replace(/,/g, '')) || 0

    return returned + returnedValue
  }, 0)

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        await refetchForm(recordId)
      } else {
        await getDefaultDT()
      }
    })()
  }, [])

  const actions = [
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode
    },
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      disabled: true
    }
  ]

  const totalConsumed = formik.values?.rows?.reduce((consumed, row) => {
    const consumedValue = parseFloat(row.consumed?.toString().replace(/,/g, '')) || 0

    return consumed + consumedValue
  }, 0)

  const producedWeight = formik.values.header.pcs * formik.values.header.avgWeight
  const totalUsedSemiFinished = producedWeight - totalConsumed

  return (
    <FormShell
      resourceId={ResourceIds.JobOrderWizard}
      functionId={SystemFunction.JobOrderWizard}
      form={formik}
      maxAccess={access}
      editMode={editMode}
      previewReport={editMode}
      actions={actions}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.MFJobOrder.qry2}
                name='header.jobId'
                label={labels.jobOrder}
                values={formik.values.header}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'date', value: 'Date', type: 'date' },
                  { key: 'sku', value: 'sku' },
                  { key: 'itemName', value: 'Item Name' },
                  { key: 'productionLineName', value: 'Production Line' }
                ]}
                required
                readOnly={editMode}
                maxAccess={access}
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.jobId', newValue?.recordId || null)
                  formik.setFieldValue('header.sku', newValue?.sku || null)
                  formik.setFieldValue('header.itemName', newValue?.itemName || '')
                  formik.setFieldValue('header.itemId', newValue?.itemId || null)
                  formik.setFieldValue('header.expectedPcs', newValue?.expectedPcs || 0)
                  formik.setFieldValue('header.pcs', newValue?.pcs || 0)
                  formik.setFieldValue('header.avgWeight', newValue?.avgWeight || 0)
                }}
                error={formik?.touched?.header?.jobId && Boolean(formik?.errors?.header?.jobId)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomDatePicker
                name='header.date'
                label={labels.date}
                readOnly={isPosted}
                value={formik?.values?.header.date}
                onChange={formik.setFieldValue}
                required
                maxAccess={access}
                onClear={() => formik.setFieldValue('header.date', null)}
                error={formik?.touched?.header?.date && Boolean(formik?.errors?.header?.date)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='header.itemId'
                label={labels.sku}
                valueField='recordId'
                displayField='name'
                valueShow='sku'
                secondValueShow='itemName'
                formObject={formik.values.header}
                form={formik}
                readOnly
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='header.expectedPcs'
                label={labels.expectedPcs}
                value={formik?.values?.header?.expectedPcs}
                maxAccess={access}
                readOnly
              />
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='header.pcs'
                label={labels.producedPcs}
                value={formik.values.header.pcs}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('header.pcs', '')}
                readOnly={isPosted}
                maxLength={9}
                required
                error={formik?.touched?.header?.pcs && Boolean(formik?.errors?.header?.pcs)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='header.avgWeight'
                label={labels.avgWeight}
                value={formik?.values?.header.avgWeight}
                maxAccess={access}
                readOnly
              />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.SFSKU.snapshot}
                name='header.sfItemId'
                label={labels.semiFinishedItem}
                valueField='sku'
                displayField='name'
                readOnly={isPosted}
                valueShow='sfItemSku'
                secondValueShow='sfItemName'
                form={formik}
                formObject={formik.values.header}
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.sfItemId', newValue?.recordId)
                  formik.setFieldValue('header.sfItemSku', newValue?.sku)
                  formik.setFieldValue('header.sfItemName', newValue?.name)
                }}
                error={formik?.touched?.header?.sfItemId && Boolean(formik?.errors?.header?.sfItemId)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='header.producedWeight'
                label={labels.producedWeight}
                value={producedWeight}
                maxAccess={access}
                readOnly
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
            maxAccess={access}
            columns={columns}
            allowAddNewLine={!isPosted}
            allowDelete={!isPosted}
            disabled={isPosted}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <CustomNumberField
                name='header.totalUsedSemiFinished'
                label={labels.totalUsedSemiFinished}
                value={totalUsedSemiFinished}
                maxAccess={access}
                readOnly
              />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={3}>
              <CustomNumberField name='header.totalIssued' label={labels.totalIssued} value={totalIssued} readOnly />
            </Grid>
            <Grid item xs={9}></Grid>
            <Grid item xs={3}>
              <CustomNumberField
                name='header.totalReturned'
                label={labels.totalReturned}
                value={totalReturned}
                maxAccess={access}
                readOnly
              />
            </Grid>
            <Grid item xs={9}></Grid>
            <Grid item xs={3}>
              <CustomNumberField
                name='header.totalConsumed'
                label={labels.totalConsumed}
                value={totalConsumed}
                maxAccess={access}
                readOnly
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
