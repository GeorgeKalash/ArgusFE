import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
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
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { useForm } from 'src/hooks/form'
import WorkFlow from 'src/components/Shared/WorkFlow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { getVatCalc } from 'src/utils/VatCalculator'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import Table from 'src/components/Shared/Table'
import TaxDetails from 'src/components/Shared/TaxDetails'
import ImportSerials from 'src/components/Shared/ImportSerials'
import { getIPR, DIRTYFIELD_UNIT_PRICE } from 'src/utils/ItemPriceCalculator'
import { SystemChecks } from 'src/resources/SystemChecks'
import { useError } from 'src/error'

export default function DraftForm({ labels, access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)

  const [userDefaultsDataState, setUserDefaultsDataState] = useState(null)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.Damage,
    access: access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.Damage.page
  })

  useEffect(() => {
    if (documentType?.dtId) {
      formik.setFieldValue('dtId', documentType.dtId)
    }
  }, [documentType?.dtId])

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: recordId || '',
      dtId: documentType?.dtId,
      reference: '',
      date: new Date(),
      plantId: null,
      notes: '',
      status: 1,
      jobId: null,
      seqNo: 0,
      pcs: 0,
      statusName: '',
      workCenterId: null,
      wcName: ''
    },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      plantId: yup.string().required(),
      jobId: yup.string().required()
    }),
    onSubmit: async obj => {
      const copy = { ...obj }
      copy.date = formatDateToApi(copy.date)

      postRequest({
        extension: ManufacturingRepository.Damage.set,
        record: JSON.stringify(copy)
      }).then(async res => {
        const actionMessage = editMode ? platformLabels.Edited : platformLabels.Added
        toast.success(actionMessage)
        await refetchForm(res.recordId)
        invalidate()
      })
    }
  })

  async function refetchForm(damageId) {
    const res = await getRequest({
      extension: ManufacturingRepository.Damage.get,
      parameters: `_recordId=${damageId}`
    }).then(res => {
      res.record.date = formatDateFromApi(res?.record?.date)
      formik.setValues(res.record)
    })
  }

  const editMode = !!formik.values.recordId
  const isPosted = formik.values.status === 3

  const onPost = async () => {
    await postRequest({
      extension: ManufacturingRepository.Damage.post,
      record: JSON.stringify(formik.values)
    }).then(async res => {
      toast.success(platformLabels.Posted)
      invalidate()

      await refetchForm(formik.values.recordId)
    })
  }

  const actions = [
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode || isPosted
    }
  ]

  useEffect(() => {
    ;(async function () {
      /* const myObject = await getDefaultsData()
      getUserDefaultsData()

      myObject?.plId
        ? formik.setFieldValue('plId', myObject?.plId)
        : stackError({
            message: labels.noSelectedplId
          })

      fillTaxStore()

      if (formik?.values?.recordId) {
        await refetchForm(formik?.values?.recordId, myObject?.plId)
      } else {
        formik.setFieldValue('currencyId', parseInt(myObject?.currencyId))
      } */
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.Damages}
      functionId={SystemFunction.Damage}
      form={formik}
      maxAccess={maxAccess}
      previewReport={editMode}
      isPosted={isPosted}
      actions={actions}
      editMode={editMode}
      disabledSubmit={isPosted && !editMode}
      disabledSavedClear={isPosted && !editMode}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.DraftSerialsIn}`}
                name='dtId'
                label={labels.documentType}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly={editMode}
                required
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={async (_, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId)
                  onChangeDtId(newValue?.recordId)
                  changeDT(newValue)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='siteId'
                readOnly={isClosed || formik?.values?.serials?.some(serial => serial.srlNo)}
                label={labels.site}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  if (!newValue?.isInactive) {
                    formik.setFieldValue('siteId', newValue?.recordId)
                    formik.setFieldValue('siteRef', newValue?.recordId)
                  } else {
                    formik.setFieldValue('siteId', null)
                    formik.setFieldValue('siteRef', null)
                    stackError({
                      message: labels.inactiveSite
                    })
                  }
                }}
                error={formik.touched.siteId && Boolean(formik.errors.siteId)}
              />
            </Grid>
            <Grid item xs={4}>
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
                readOnly={isClosed}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.recordId)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik?.values?.reference}
                maxAccess={!editMode && maxAccess}
                readOnly={editMode}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={4}>
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
                  formik.setFieldValue('plantId', newValue?.recordId)
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={formik?.values?.clientId && SaleRepository.Contact.contact}
                parameters={`_clientId=${formik.values.clientId}`}
                name='contactId'
                label={labels.contact}
                readOnly={isClosed}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('contactId', newValue ? newValue.recordId : null)
                }}
                error={formik.touched.contactId && Boolean(formik.errors.contactId)}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomDatePicker
                name='date'
                required
                label={labels.date}
                value={formik?.values?.date}
                onChange={formik.setFieldValue}
                editMode={editMode}
                readOnly={isClosed}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={SaleRepository.SalesPerson.qry}
                name='spId'
                required
                label={labels.salesPerson}
                columnsInDropDown={[
                  { key: 'spRef', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly={isClosed}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('spId', newValue ? newValue.recordId : null)
                }}
                error={formik.touched.spId && Boolean(formik.errors.spId)}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={FinancialRepository.TaxSchedules.qry}
                name='taxId'
                label={labels.tax}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('taxId', newValue?.recordId || null)
                }}
                error={formik.touched.taxId && Boolean(formik.errors.taxId)}
              />
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={SaleRepository.Client.snapshot}
                    filter={{ isInactive: false }}
                    valueField='reference'
                    displayField='name'
                    secondFieldLabel={labels.name}
                    name='clientId'
                    label={labels.client}
                    form={formik}
                    required
                    readOnly={isClosed}
                    displayFieldWidth={2}
                    valueShow='clientRef'
                    secondValueShow='clientName'
                    maxAccess={maxAccess}
                    editMode={editMode}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'szName', value: 'Sales Zone' },
                      { key: 'keywords', value: 'Keywords' },
                      { key: 'cgName', value: 'Client Group' }
                    ]}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('clientId', newValue?.recordId)
                      formik.setFieldValue('clientName', newValue?.name)
                      formik.setFieldValue('clientRef', newValue?.reference)
                      formik.setFieldValue('accountId', newValue?.accountId)
                      formik.setFieldValue('isVattable', newValue?.isSubjectToVAT || false)
                      formik.setFieldValue('taxId', newValue?.taxId)
                    }}
                    errorCheck={'clientId'}
                  />
                </Grid>
                <Grid item xs={5}>
                  <CustomTextField
                    name='search'
                    value={formik.values.search}
                    label={platformLabels.Search}
                    onClear={() => {
                      formik.setFieldValue('search', '')
                    }}
                    onChange={handleSearchChange}
                    onSearch={e => formik.setFieldValue('search', e)}
                    search={true}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <CustomTextArea
                name='description'
                label={labels.description}
                value={formik.values.description}
                rows={2}
                editMode={editMode}
                readOnly={isClosed}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('description', e.target.value)}
                onClear={() => formik.setFieldValue('description', '')}
                error={formik.touched.description && Boolean(formik.errors.description)}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={(value, action, row) => {
              let result = value
              if (action == 'delete') {
                if (formik?.values?.search) {
                  setGridserials(result)
                }
                result = formik?.values?.serials?.filter(item => item?.id !== row?.id)
              }
              formik.setFieldValue('serials', result)
            }}
            value={filteredData || []}
            error={formik.errors.serials}
            columns={serialsColumns}
            name='serials'
            maxAccess={maxAccess}
            disabled={isClosed || !formik.values.clientId}
            allowDelete={!isClosed}
            allowAddNewLine={!formik?.values?.search}
            autoDelete={autoDelete}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={16}>
            <Grid item xs={8}>
              <Grid container>
                <Grid item xs={12} height={125} sx={{ display: 'flex', flex: 1 }}>
                  <Table
                    gridData={{ count: 1, list: formik?.values?.metalGridData }}
                    maxAccess={access}
                    columns={[
                      { field: 'metal', headerName: labels.metal, flex: 1 },
                      { field: 'pcs', headerName: labels.pcs, type: 'number', flex: 1 },
                      { field: 'totalWeight', headerName: labels.totalWeight, type: 'number', flex: 1 }
                    ]}
                    rowId={['metal']}
                    pagination={false}
                  />
                </Grid>
                <Grid item xs={12} height={125} sx={{ display: 'flex', flex: 1 }}>
                  <Table
                    columns={[
                      { field: 'seqNo', headerName: labels.seqNo, type: 'number', flex: 1 },
                      { field: 'sku', headerName: labels.sku, flex: 1 },
                      { field: 'itemName', headerName: labels.itemDesc, flex: 2 },
                      { field: 'pcs', headerName: labels.pcs, type: 'number', flex: 1 },
                      { field: 'weight', headerName: labels.weight, type: 'number', flex: 1 }
                    ]}
                    gridData={{ count: 1, list: formik?.values?.itemGridData }}
                    rowId={['sku']}
                    maxAccess={access}
                    pagination={false}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='subTotal'
                    maxAccess={maxAccess}
                    label={labels.subtotal}
                    value={subtotal}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='vatAmount'
                    maxAccess={maxAccess}
                    label={labels.vat}
                    value={vatAmount}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='total'
                    maxAccess={maxAccess}
                    label={labels.total}
                    value={formik?.values?.amount || 0}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='totalWeight'
                    maxAccess={maxAccess}
                    label={labels.totalWeight}
                    value={totalWeight}
                    readOnly
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
