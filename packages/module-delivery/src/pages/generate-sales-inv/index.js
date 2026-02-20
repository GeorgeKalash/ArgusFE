import { useState, useContext } from 'react'
import * as yup from 'yup'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { Grid } from '@mui/material'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { DeliveryRepository } from '@argus/repositories/src/repositories/DeliveryRepository'
import InvDetailsForm from './forms/InvDetailsForm'
import { formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import toast from 'react-hot-toast'
import SaleTransactionForm from '@argus/shared-ui/src/components/Shared/Forms/SaleTransactionForm'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

const GeneratePurchaseInvoice = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults } = useContext(DefaultsContext)
  const { stack, LockRecord } = useWindow()

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.GenerateInvoices
  })

  const { labels: _labels, access: maxAccess } = useResourceQuery({
    datasetId: ResourceIds.SalesInvoice
  })

  const defCurrencyId = parseInt(systemDefaults?.list?.find(({ key }) => key === 'currencyId')?.value)

  const basicValidation = {
    clientId: yup.number().required(),
    currencyId: yup.number().required()
  }

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
    validationSchema: yup.object(validationMode),
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

      title: _labels.salesInvoice
    })
  }

  async function openInvDetailsForm() {
    stack({
      Component: InvDetailsForm,
      props: {
        labels,
        access,
        values: formik?.values,
        setValues: formik?.setValues
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
    setValidationMode({ ...basicValidation, dtId: yup.number().required() })

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

      formik.setFieldValue('plantId', dtd?.record?.plantId)
    }
  }

  return (
    <Form onSave={onGenerateSI} isSaved={false} maxAccess={access} fullSize>
      <VertLayout>
        <Fixed>
          <Grid container spacing={2} p={2}>
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
                valueField='recordId'
                displayField={['spRef', 'name']}
                columnsInDropDown={[
                  { key: 'spRef', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
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
        </Grow>
        <Fixed>
          <Grid container spacing={2} p={2}>
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
              <CustomButton
                onClick={openInvDetailsForm}
                label={labels.moreDet}
                tooltipText={labels.moreDet}
                color='#231f20'
                image={'notes.png'}
              />
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
    </Form>
  )
}

export default GeneratePurchaseInvoice
