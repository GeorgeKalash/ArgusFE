import { useState, useContext } from 'react'
import * as yup from 'yup'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import { useResourceQuery } from 'src/hooks/resource'
import { Grid } from '@mui/material'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import PurchaseTransactionForm from '../pu-trx/[functionId]/PurchaseTransactionForm'
import { useWindow } from 'src/windows'
import CustomButton from 'src/components/Inputs/CustomButton'
import { SystemFunction } from 'src/resources/SystemFunction'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import PuDetailsForm from './forms/PuDetailsForm'
import { formatDateToApi } from 'src/lib/date-helper'
import toast from 'react-hot-toast'
import Form from 'src/components/Shared/Form'

const GeneratePurchaseInvoice = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)
  const { stack } = useWindow()

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.GeneratePUInvoices
  })

  const { labels: _labels, access: maxAccess } = useResourceQuery({
    datasetId: ResourceIds.PurchaseInvoice
  })

  const defCurrencyId = parseInt(defaultsData?.list?.find(({ key }) => key === 'PUCurrencyId')?.value)

  const basicValidation = yup.object({
    vendorId: yup.number().required(),
    currencyId: yup.number().required()
  })

  const fullValidation = yup.object({
    vendorId: yup.number().required(),
    currencyId: yup.number().required(),
    dtId: yup.number().required(),
    plantId: yup.number().required()
  })

  const [validationMode, setValidationMode] = useState(basicValidation)

  const { formik } = useForm({
    initialValues: {
      vendorId: null,
      vendorRef: '',
      vendorName: '',
      currencyId: defCurrencyId,
      dtId: null,
      plantId: null,
      amount: 0,
      date: null,
      description: '',
      data: { list: [] }
    },
    validationSchema: validationMode,
    maxAccess: access,
    validateOnChange: true,
    onSubmit: async obj => {
      const { data, amount, vendorRef, vendorName, date, ...rest } = obj

      const genData = {
        ...rest,
        date: formatDateToApi(date || new Date()),
        shipments: data?.list?.filter(item => item.checked)?.map(item => parseInt(item.shipmentId)) || []
      }

      const res = await postRequest({
        extension: PurchaseRepository.PurchaseInvoiceHeader.generate,
        record: JSON.stringify(genData)
      })

      onPreviewShipments()

      if (res.recordId) {
        toast.success(platformLabels.Generated)
        await openForm(res.recordId)
      }
    }
  })

  async function openForm(recordId) {
    stack({
      Component: PurchaseTransactionForm,
      props: {
        labels: _labels,
        recordId,
        maxAccess,
        functionId: SystemFunction.PurchaseInvoice
      },
      width: 1330,
      height: 720,
      title: _labels.purchaseInvoice
    })
  }

  async function openPUDetailsForm() {
    stack({
      Component: PuDetailsForm,
      props: {
        labels,
        access,
        form: formik
      },
      width: 500,
      height: 300,
      title: labels.edit
    })
  }

  function totalAmountFromChecked() {
    formik?.setFieldValue(
      'amount',
      formik?.values?.data?.list
        .filter(row => row.checked)
        .reduce((amountSum, row) => {
          let amountValue = 0
          if (row.checked) {
            amountValue = parseFloat(row?.amountAfterVat?.toString().replace(/,/g, '')) || 0
          }

          return amountSum + amountValue
        }, 0) || 0
    )
  }

  const columns = [
    {
      field: 'shipmentRef',
      headerName: labels.shipmentRef,
      flex: 1
    },
    {
      field: 'shipmentDate',
      headerName: labels.shipmentDate,
      type: 'date',
      flex: 1
    },
    {
      field: 'qty',
      headerName: labels.qty,
      type: { field: 'number', decimal: 2 },
      flex: 1
    },
    {
      field: 'poRef',
      headerName: labels.poRef,
      flex: 1
    },
    {
      field: 'poDate',
      headerName: labels.poDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'amountBeforeVat',
      headerName: labels.amountBeforeVat,
      type: { field: 'number', decimal: 2 },
      flex: 1
    },
    {
      field: 'vatAmount',
      headerName: labels.vatAmount,
      type: { field: 'number', decimal: 2 },
      flex: 1
    },
    {
      field: 'amountAfterVat',
      headerName: labels.amountAfterVat,
      type: { field: 'number', decimal: 2 },
      flex: 1
    }
  ]

  const onPreviewShipments = async () => {
    setValidationMode(basicValidation)

    if (Object.keys(await formik.validateForm()).length) {
      const errors = await formik.validateForm()

      const touchedFields = Object.keys(errors).reduce((acc, key) => {
        acc[key] = true

        return acc
      }, {})

      formik.setTouched(touchedFields, true)

      return
    }

    const res = await getRequest({
      extension: PurchaseRepository.PurchaseInvoiceHeader.preview,
      parameters: `_vendorId=${formik?.values?.vendorId}&_currencyId=${formik?.values?.currencyId}`
    })

    formik.setFieldValue('data', { list: res?.list || [] })
    formik.setFieldValue('amount', 0)
  }

  const onGeneratePI = async () => {
    setValidationMode(fullValidation)

    if (Object.keys(await formik.validateForm()).length) {
      const errors = await formik.validateForm()

      const touchedFields = Object.keys(errors).reduce((acc, key) => {
        acc[key] = true

        return acc
      }, {})

      formik.setTouched(touchedFields, true)

      return
    }

    formik.handleSubmit()
  }

  async function onChangeDtId(recordId) {
    if (recordId) {
      const dtd = await getRequest({
        extension: PurchaseRepository.DocumentTypeDefault.get,
        parameters: `_dtId=${recordId}`
      })

      formik.setFieldValue('plantId', dtd?.record?.plantId || null)
    }
  }

  return (
    <Form onSave={onGeneratePI} maxAccess={access} isSaved={false}>
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={5}>
              <ResourceLookup
                endpointId={PurchaseRepository.Vendor.snapshot}
                valueField='reference'
                displayField='name'
                secondFieldLabel={labels.name}
                name='vendorId'
                label={labels.vendor}
                form={formik}
                required
                displayFieldWidth={2}
                valueShow='vendorRef'
                secondValueShow='vendorName'
                maxAccess={maxAccess}
                secondFieldName={'vendorName'}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                  { key: 'flName', value: 'Foreign Language' }
                ]}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('vendorName', newValue?.name || '')
                  formik.setFieldValue('vendorRef', newValue?.reference || '')
                  if (!newValue?.recordId) {
                    formik.setFieldValue('items', formik?.initialValues?.items)
                  }
                  formik.setFieldValue('vendorId', newValue?.recordId || null)
                }}
                error={formik.touched.vendorId && Boolean(formik.errors.vendorId)}
              />
            </Grid>
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                required
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.recordId || null)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={0.5}></Grid>
            <Grid item xs={1}>
              <CustomButton
                onClick={onPreviewShipments}
                tooltipText={platformLabels.Preview}
                image={'preview.png'}
                color='#231f20'
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Grid item xs={3} sx={{ display: 'flex', flex: 1 }}>
            <Table
              columns={columns}
              gridData={formik?.values?.data}
              rowId={['shipmentId']}
              isLoading={false}
              pagination={false}
              maxAccess={access}
              showCheckboxColumn={true}
              showSelectAll={true}
              handleCheckboxChange={totalAmountFromChecked}
            />
          </Grid>
        </Grow>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.PurchaseInvoice}`}
                name='dtId'
                label={labels.documentType}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                required
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId || null)
                  await onChangeDtId(newValue?.recordId)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={2.5}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                readOnly
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue?.recordId || null)
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={0.25}></Grid>
            <Grid item>
              <CustomButton onClick={openPUDetailsForm} label={labels.edit} color='#231f20' image={'notes.png'} />
            </Grid>
            <Grid item xs={0.25}>
              <CustomButton
                onClick={onGeneratePI}
                label={platformLabels.Generate}
                color='#231f20'
                tooltipText={platformLabels.Generate}
                image={'generate.png'}
              />
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={1.5}>
              <CustomNumberField name='amount' label='' value={formik?.values?.amount} readOnly align='right' />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </Form>
  )
}

export default GeneratePurchaseInvoice
