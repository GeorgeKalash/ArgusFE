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
import FormShell from 'src/components/Shared/FormShell'
import { ControlContext } from 'src/providers/ControlContext'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { useWindow } from 'src/windows'
import CustomButton from 'src/components/Inputs/CustomButton'
import { SystemFunction } from 'src/resources/SystemFunction'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { DeliveryRepository } from 'src/repositories/DeliveryRepository'
import InvDetailsForm from './forms/InvDetailsForm'
import { formatDateToApi } from 'src/lib/date-helper'
import toast from 'react-hot-toast'
import SaleTransactionForm from '../sa-trx/[functionId]/forms/SaleTransactionForm'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'

const GeneratePurchaseInvoice = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)
  const { stack, LockRecord } = useWindow()

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.GenerateInvoices
  })

  const { labels: _labels, access: maxAccess } = useResourceQuery({
    datasetId: ResourceIds.SalesInvoice
  })

  const defCurrencyId = parseInt(defaultsData?.list?.find(({ key }) => key === 'currencyId')?.value)

  const basicValidation = yup.object({
    clientId: yup.number().required(),
    currencyId: yup.number().required()
  })

  const fullValidation = yup.object({
    clientId: yup.number().required(),
    currencyId: yup.number().required(),
    dtId: yup.number().required()
  })

  const [validationMode, setValidationMode] = useState(basicValidation)

  const { formik } = useForm({
    initialValues: {
      clientId: null,
      clientRef: '',
      clientName: '',
      applyVAT: false,
      currencyId: defCurrencyId,
      spId: 0,
      dtId: null,
      amount: 0,
      date: null,
      plantId: null,
      description: '',
      data: { list: [] }
    },
    validationSchema: validationMode,
    maxAccess: access,
    validateOnChange: true,
    onSubmit: async obj => {
      const { data, amount, clientRef, clientName, date, spId, ...rest } = obj

      const genData = {
        ...rest,
        date: formatDateToApi(date || new Date()),
        spId: spId || null,
        deliveryOrders: data?.list?.filter(item => item.checked)?.map(item => parseInt(item.orderId)) || []
      }

      const res = await postRequest({
        extension: DeliveryRepository.Invoice.generateInv,
        record: JSON.stringify(genData)
      })

      onPreviewOrders()

      if (res.recordId) {
        toast.success(platformLabels.Generated)
        await openForm(res.recordId)
      }
    }
  })

  async function openForm(recordId) {
    stack({
      Component: SaleTransactionForm,
      props: {
        labels: _labels,
        recordId,
        access: maxAccess,
        functionId: SystemFunction.SalesInvoice,
        getResourceId: () => ResourceIds.SalesInvoice,
        LockRecord
      },
      width: 1330,
      height: 720,
      title: _labels.purchaseInvoice
    })
  }

  async function openInvDetailsForm() {
    stack({
      Component: InvDetailsForm,
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
      field: 'doRef',
      headerName: labels.doRef,
      flex: 1
    },
    {
      field: 'doDate',
      headerName: labels.doDate,
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
      field: 'soRef',
      headerName: labels.soRef,
      flex: 1
    },
    {
      field: 'soDate',
      headerName: labels.soDate,
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

  const onPreviewOrders = async () => {
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
      extension: DeliveryRepository.Invoice.preview,
      parameters: `_clientId=${formik?.values?.clientId}&_currencyId=${formik?.values?.currencyId}&_spId=${formik?.values?.spId}`
    })

    formik.setFieldValue('data', { list: res?.list || [] })
    formik.setFieldValue('amount', 0)
  }

  const onGenerateSI = async () => {
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
        extension: SaleRepository.DocumentTypeDefault.get,
        parameters: `_dtId=${recordId}`
      })

      formik.setFieldValue('plantId', dtd?.record?.plantId || null)
    }
  }

  return (
    <FormShell
      resourceId={ResourceIds.GenerateInvoices}
      form={formik}
      maxAccess={access}
      isCleared={false}
      isSaved={false}
      infoVisible={false}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={5}>
              <ResourceLookup
                endpointId={SaleRepository.Client.snapshot}
                valueField='reference'
                displayField='name'
                secondFieldLabel={labels.name}
                name='clientId'
                label={labels.client}
                form={formik}
                required
                displayFieldWidth={2}
                valueShow='clientRef'
                secondValueShow='clientName'
                maxAccess={maxAccess}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                  { key: 'flName', value: 'Foreign Language' }
                ]}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('clientName', newValue?.name)
                  formik.setFieldValue('clientRef', newValue?.reference)
                  formik.setFieldValue('applyVAT', newValue?.isSubjectToVAT || false)
                  formik.setFieldValue('clientId', newValue?.recordId || null)
                  if (!newValue?.recordId) {
                    formik.setFieldValue('items', formik?.initialValues?.items)
                  }
                }}
                errorCheck={'clientId'}
              />
            </Grid>
            <Grid item xs={0.75}>
              <CustomCheckBox
                name='applyVAT'
                value={formik.values?.applyVAT}
                onChange={event => formik.setFieldValue('applyVAT', event.target.checked)}
                label={labels.applyVAT}
                maxAccess={maxAccess}
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
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={SaleRepository.SalesPerson.qry}
                name='spId'
                label={labels.salesPerson}
                columnsInDropDown={[{ key: 'name', value: 'Name' }]}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('spId', newValue?.recordId || 0)
                }}
                error={formik.touched.spId && Boolean(formik.errors.spId)}
              />
            </Grid>
            <Grid item xs={0.5}></Grid>
            <Grid item xs={1}>
              <CustomButton
                onClick={onPreviewOrders}
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
              rowId={['orderId']}
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
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.SalesInvoice}`}
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
            <Grid item xs={2}>
              <CustomButton onClick={openInvDetailsForm} label={labels.edit} color='#231f20' image={'notes.png'} />
            </Grid>
            <Grid item xs={1}>
              <CustomButton
                onClick={onGenerateSI}
                label={platformLabels.Generate}
                color='#231f20'
                tooltipText={platformLabels.Generate}
                image={'generate.png'}
              />
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={1.5}>
              <CustomNumberField
                name='amount'
                label={labels.amount}
                value={formik?.values?.amount}
                readOnly
                align='right'
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

export default GeneratePurchaseInvoice
