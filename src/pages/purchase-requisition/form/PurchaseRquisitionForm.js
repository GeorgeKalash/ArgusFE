import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
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
import { SaleRepository } from 'src/repositories/SaleRepository'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { useForm } from 'src/hooks/form'
import WorkFlow from 'src/components/Shared/WorkFlow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import {
  getIPR,
  DIRTYFIELD_QTY,
  DIRTYFIELD_BASE_PRICE,
  DIRTYFIELD_UNIT_PRICE,
  DIRTYFIELD_MDAMOUNT,
  DIRTYFIELD_UPO,
  DIRTYFIELD_EXTENDED_PRICE,
  DIRTYFIELD_MDTYPE,
  MDTYPE_PCT,
  MDTYPE_AMOUNT
} from 'src/utils/ItemPriceCalculator'
import { getVatCalc } from 'src/utils/VatCalculator'
import { getDiscValues, getFooterTotals, getSubtotal } from 'src/utils/FooterCalculator'
import { AddressFormShell } from 'src/components/Shared/AddressFormShell'
import AddressFilterForm from 'src/components/Shared/AddressFilterForm'
import { useError } from 'src/error'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import SalesTrxForm from 'src/components/Shared/SalesTrxForm'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import TaxDetails from 'src/components/Shared/TaxDetails'
import { createConditionalSchema } from 'src/lib/validation'
import useResourceParams from 'src/hooks/useResourceParams'
import useSetWindow from 'src/hooks/useSetWindow'
import { DataSets } from 'src/resources/DataSets'
import { companyStructureRepository } from 'src/repositories/companyStructureRepository'

export default function PurchaseRquisitionForm({ recordId, labels, access }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const filteredMeasurements = useRef([])
  const [measurements, setMeasurements] = useState([])

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.PurchaseRequisition,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: PurchaseRepository.PurchaseRequisition.page
  })

  const conditions = {
    sku: row => row?.sku,
    itemName: row => row?.itemName,
    qty: row => row?.qty > 0,
    muId: row => row?.muId
  }

  const { schema, requiredFields } = createConditionalSchema(conditions, allowNoLines, maxAccess, 'items')

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    conditionSchema: ['items'],
    initialValues: {
      recordId,
      dtId: null,
      dgId: null,
      reference: '',
      status: 1,
      date: new Date(),
      procurementType: null,
      siteId: null,
      deliveryDate: new Date(),
      notes: '',
      vendorId: null,
      plantId: null,
      departmentId: null,
      releaseStatus: null,
      wip: 1,
      items: [
        {
          id: 1,
          trxId: recordId,
          sku: null,
          seqNo: null,
          itemId: null,
          itemName: '',
          siteId: null,
          muId: null,
          muQty: 0,
          qty: 0,
          baseQty: 0,
          deliveryDate: new Date(),
          status: null,
          vendorId: null,
          onHand: 0,
          lastPurchaseDate: null,
          lastPurchaseCurrencyId: null,
          lastPurchaseUnitPrice: 0,
          unitCost: 0,
          totalCost: 0,
          justification: ''
        }
      ]
    },
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required(),
      procurementType: yup.date().required(),
      items: yup.array().of(schema)
    }),
    onSubmit: async obj => {}
  })

  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip == 2

  async function getFilteredMU(itemId) {
    if (!itemId) return

    const currentItemId = formik.values.items?.find(item => parseInt(item.itemId) === itemId)?.msId

    const arrayMU = measurements?.filter(item => item.msId === currentItemId) || []
    filteredMeasurements.current = arrayMU
  }

  return (
    <FormShell
      resourceId={ResourceIds.PurchaseRequisition}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      previewReport={editMode}
      disabledSubmit={isClosed}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.PurchaseRequisition}`}
                    name='dtId'
                    label={labels.documentType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={isClosed}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values}
                    maxAccess={!editMode && maxAccess}
                    onChange={async (event, newValue) => {
                      await changeDT(newValue)
                      formik.setFieldValue('dtId', newValue?.recordId || null)
                    }}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik?.values?.reference}
                    maxAccess={!editMode && maxAccess}
                    readOnly={isClosed}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    readOnly={isClosed}
                    value={formik?.values?.date}
                    onChange={formik.setFieldValue}
                    required
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('date', null)}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.PROCUREMENT_TYPE}
                    name='procurementType'
                    label={labels.procurementType}
                    readOnly={isClosed}
                    values={formik.values}
                    valueField='key'
                    displayField='value'
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('procurementType', newValue?.key || null)
                    }}
                    error={formik.touched.procurementType && Boolean(formik.errors.procurementType)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={PurchaseRepository.Vendor.snapshot}
                    valueField='reference'
                    displayField='name'
                    name='vendorId'
                    label={labels.vendor}
                    form={formik}
                    readOnly={isClosed}
                    displayFieldWidth={3}
                    valueShow='vendorRef'
                    secondValueShow='vendorName'
                    maxAccess={maxAccess}
                    editMode={editMode}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('vendorId', newValue?.recordId || null)
                      formik.setFieldValue('vendorName', newValue?.name || '')
                      formik.setFieldValue('vendorRef', newValue?.reference || '')
                    }}
                    errorCheck={'vendorId'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={companyStructureRepository.DepartmentFilters.qry}
                    parameters={`_filter=&_size=1000&_startAt=0&_type=0&_activeStatus=0&_sortBy=recordId`}
                    name='departmentId'
                    readOnly={isClosed}
                    label={labels.department}
                    values={formik.values}
                    displayField='name'
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('departmentId', newValue?.recordId || null)
                    }}
                    error={formik.touched.departmentId && Boolean(formik.errors.departmentId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='siteId'
                    readOnly={isClosed}
                    label={labels.site}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('siteId', newValue?.recordId || null)
                    }}
                    error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='deliveryDate'
                    label={labels.deliveryDate}
                    readOnly={isClosed}
                    value={formik?.values?.deliveryDate}
                    onChange={formik.setFieldValue}
                    required
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('deliveryDate', null)}
                    error={formik.touched.deliveryDate && Boolean(formik.errors.deliveryDate)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='plantId'
                    label={labels.plant}
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
                      formik.setFieldValue('plantId', newValue?.recordId || null)
                    }}
                    error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='notes'
                    label={labels.notes}
                    value={formik?.values?.notes}
                    rows={2.5}
                    readOnly={isClosed}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('notes', '')}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow></Grow>
        <Fixed>
          <Grid container xs={6}>
            <CustomTextField
              name='totalCost'
              label={labels.totalCost}
              maxAccess={maxAccess}
              value={totalCost}
              readOnly
            />
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
