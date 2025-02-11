import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { useContext, useEffect } from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useInvalidate } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { DataSets } from 'src/resources/DataSets'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { MasterSource } from 'src/resources/MasterSource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { useRefBehavior } from 'src/hooks/useReferenceProxy'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'

const ClientsForms = ({ labels, maxAccess: access, setStore, store }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const { changeDT, maxAccess } = useRefBehavior({
    access: access,
    readOnlyOnEditMode: store.recordId,
    name: 'reference'
  })

  const invalidate = useInvalidate({
    endpointId: SaleRepository.Client.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      cgId: '',
      gpName: '',
      reference: null,
      name: '',
      keywords: null,
      flName: '',
      accountId: null,
      accountRef: '',
      accountName: '',
      bpId: null,
      BpRef: null,
      szId: null,
      spId: null,
      acquisitionDate: new Date(),
      isSubjectToVAT: null,
      vatNumber: '',
      taxId: null,
      isInactive: false
    },
    maxAccess: maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      cgId: yup.string().required()
    }),
    onSubmit: async values => {
      const res = await postRequest({
        extension: SaleRepository.Client.set,
        record: JSON.stringify(values)
      })

      if (!values.recordId) {
        setStore(prevStore => ({
          ...prevStore,
          recordId: res.recordId
        }))
        formik.setFieldValue('recordId', res.recordId)
        toast.success(platformLabels.Added)
      } else toast.success(platformLabels.Edited)
      await getData(res.recordId)
      setStore(prevStore => ({
        ...prevStore,
        record: formik.values,
        recordId: formik.values.recordId || res.recordId
      }))

      invalidate()
    }
    })

  useEffect(() => {
    ;(async function () {
      await getData(recordId)
    })()
  }, [])

  const getData = async recordId => {
    if (recordId) {
      const res = await getRequest({
        extension: SaleRepository.Client.get,
        parameters: `_recordId=${recordId}`
      })

      formik.setValues({
        ...res.record,
        acquisitionDate: formatDateFromApi(res?.record?.acquisitionDate)
      })
      
      setStore(prevStore => ({
        ...prevStore,
        record: res.record
      }))
    }
  }

  const editMode = !!formik.values.recordId

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'Integration Account',
      condition: true,
      onClick: 'onClickGIA',
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.Client}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      masterSource={MasterSource.Account}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SaleRepository.ClientGroups.qry}
                name='cgId'
                readOnly={editMode}
                required
                label={labels.cGroup}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('cgId', newValue?.recordId || '')
                  changeDT(newValue)
                }}
                error={formik.touched.cgId && Boolean(formik.errors.cgId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                readOnly={editMode}
                label={labels.reference}
                value={formik.values.reference}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='keywords'
                label={labels.keyWords}
                value={formik.values.keywords}
                maxAccess={maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('keywords', '')}
                error={formik.touched.keywords && Boolean(formik.errors.keywords)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='flName'
                label={labels.foreignLanguage}
                value={formik.values.flName}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('flName', '')}
                error={formik.touched.flName && Boolean(formik.errors.flName)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={FinancialRepository.Account.snapshot}
                name='accountId'
                label={labels.account}
                valueField='reference'
                displayField='name'
                valueShow='accountRef'
                secondValueShow='accountName'
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
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SaleRepository.SalesPerson.qry}
                name='spId'
                label={labels.salesPerson}
                columnsInDropDown={[
                  { key: 'spRef', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('spId', newValue?.recordId)
                  } else {
                    formik.setFieldValue('spId', '')
                  }
                }}
                error={formik.touched.spId && Boolean(formik.errors.spId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SaleRepository.SalesZone.qry}
                parameters={`_startAt=0&_pageSize=1000&_sortField="recordId"&_filter=`}
                name='szId'
                label={labels.saleZone}
                columnsInDropDown={[{ key: 'name', value: 'Name' }]}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('szId', newValue?.recordId)
                  } else {
                    formik.setFieldValue('szId', '')
                  }
                }}
                error={formik.touched.szId && Boolean(formik.errors.szId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.LANGUAGE}
                name='languageId'
                label={labels.language}
                valueField='key'
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('languageId', newValue?.key ?? '')
                }}
                error={formik.touched.languageId && Boolean(formik.errors.languageId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='acquisitionDate'
                label={labels.acquisitionDate}
                value={formik.values.acquisitionDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('acquisitionDate', '')}
                error={formik.touched.acquisitionDate && Boolean(formik.errors.acquisitionDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='isSubjectToVAT'
                value={formik.values?.isSubjectToVAT}
                onChange={event => {
                  formik.setFieldValue('isSubjectToVAT', event.target.checked)
                  if (!event.target.checked) {
                    formik.setFieldValue('vatNumber', '')
                    formik.setFieldValue('taxId', '')
                  }
                }}
                label={labels.vat}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='vatNumber'
                label={labels.vatNo}
                value={formik.values.vatNumber}
                readOnly={!formik.values?.isSubjectToVAT}
                maxAccess={maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('vatNumber', '')}
                error={formik.touched.vatNumber && Boolean(formik.errors.vatNumber)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Items.pack}
                reducer={response => {
                  return response?.record?.taxSchedules
                }}
                values={formik.values}
                name='taxId'
                label={labels.tax}
                valueField='recordId'
                displayField='name'
                displayFieldWidth={1}
                maxAccess={maxAccess}
                readOnly={!formik.values?.isSubjectToVAT}
                onChange={(event, newValue) => {
                  formik.setFieldValue('taxId', newValue?.recordId || '')
                }}
                error={formik.touched.taxId && formik.errors.taxId}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={BusinessPartnerRepository.MasterData.snapshot}
                name='bpRef'
                label={labels.bpRef}
                valueField='reference'
                valueShow='bpRef'
                secondDisplayField={false}
                form={formik}
                onChange={(event, newValue) => {
                  formik.setValues({
                    ...formik.values,
                    bpId: newValue?.recordId || '',
                    bpRef: newValue?.reference || ''
                  })
                }}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='isInactive'
                value={formik.values?.isInactive}
                onChange={event => formik.setFieldValue('isInactive', event.target.checked)}
                label={labels.inactive}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default ClientsForms
