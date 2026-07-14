import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { BenefitsRepository } from '@argus/repositories/src/repositories/BenefitsRepository'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { formatDateForGetApI, formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { roundTo } from '@argus/shared-domain/src/lib/numberField-helper'
import { useError } from '@argus/shared-providers/src/providers/error'

export default function BenefitAcquisitionForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults } = useContext(DefaultsContext)
  const { stack: stackError } = useError()

  const invalidate = useInvalidate({
    endpointId: BenefitsRepository.BenefitAcquisition.page
  })

  const bsDefault = parseInt(systemDefaults?.list?.find(obj => obj.key === 'bsId')?.value) || null

  const initialValues = {
    recordId: recordId || null,
    employeeId: null,
    employeeName: '',
    bsId: null,
    benefitId: null,
    aqType: null,
    deliveryType: null,
    aqDate: new Date(),
    dateFrom: null,
    dateTo: null,
    isHijriDate: false,
    period: '',
    aqRatio: null,
    amount: null,
    aqAmount: 0,
    amountDue: 0,
    settlementId: null,
    notes: '',
    nationality: '',
    branchName: '',
    departmentName: '',
    positionName: '',
    hireDate: null,
    esName: '',
    loanBalance: 0,
    divisionName: '',
    reportToName: '',
    eosBalance: 0,
    serviceDuration: ''
  }

  const { formik } = useForm({
    maxAccess,
    initialValues,
    validationSchema: yup.object({
      employeeId: yup.number().required(),
      benefitId: yup.number().required(),
      aqDate: yup.date().required(),
      aqType: yup.string().required(),
      dateFrom: yup.date().required(),
      dateTo: yup.date().required(),
      deliveryType: yup.string().required(),
      amount: yup.number().required()
    }),
    onSubmit: handleSubmit
  })

  async function handleSubmit(obj) {
    const payload = {
      ...obj,
      aqDate: formatDateToApi(obj.aqDate),
      dateFrom: formatDateToApi(obj.dateFrom),
      dateTo: formatDateToApi(obj.dateTo),
      settlementId: obj.settlementId || null
    }

    const response = await postRequest({
      extension: BenefitsRepository.BenefitAcquisition.set,
      record: JSON.stringify(payload)
    })

    if (!obj.recordId) formik.setFieldValue('recordId', response.recordId)
    toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
    invalidate()
  }

  const editMode = !!formik.values.recordId

  async function fetchEmployeeQuickView(employeeId) {
    if (!employeeId) return {}

    const res = await getRequest({
      extension: EmployeeRepository.QuickView.get,
      parameters: `_recordId=${employeeId}&_asOfDate=${formatDateForGetApI(new Date())}`
    })

    const values = res?.record

    return {
      departmentName: values?.departmentName || '',
      positionName: values?.positionName || '',
      hireDate: values?.hireDate ? formatDateFromApi(values?.hireDate) : null,
      nationality: values?.countryName || '',
      divisionName: values?.divisionName || '',
      reportToName: values?.reportToName || '',
      eosBalance: values?.indemnity || 0,
      serviceDuration: values?.serviceDuration || '',
      esName: values?.esName || '',
      loanBalance: values?.loanBalance || 0
    }
  }

  async function resolveBenefitSchedule(employeeId) {
    const hireRes = await getRequest({
      extension: EmployeeRepository.Hiring.get,
      parameters: `_employeeId=${employeeId}`
    })

    let bsId = hireRes?.record?.bsId || null
    let bsName = hireRes?.record?.bsName || ''

    if (!bsId) {
      if (bsDefault) {
        const res = await getRequest({
          extension: BenefitsRepository.BenefitSchedule.get,
          parameters: `_recordId=${bsDefault}`
        })
        bsId = bsDefault
        bsName = res?.record.name || ''
      } else {
        stackError({ message: labels.noBenefitSchedule })
      }
    }

    return { bsId, bsName }
  }

  function calculatePeriodAndAqRatio({ employeeId, benefitId, bsId, dateFrom, dateTo, amount }) {
    if (!employeeId || !benefitId || !bsId || !dateFrom || !dateTo || !amount) return {}

    const days = Math.round((new Date(dateTo) - new Date(dateFrom)) / (1000 * 60 * 60 * 24))

    return {
      period: String(days),
      aqRatio: roundTo(days / 360, 3)
    }
  }

  useEffect(() => {
    const fetchRecord = async () => {
      if (!recordId) return

      const res = await getRequest({
        extension: BenefitsRepository.BenefitAcquisition.get,
        parameters: `_recordId=${recordId}`
      })

      const record = res?.record || {}
      const employeeQuickView = await fetchEmployeeQuickView(record.employeeId)

      formik.setValues({
        ...record,
        aqDate: formatDateFromApi(record.aqDate),
        dateFrom: formatDateFromApi(record.dateFrom),
        dateTo: formatDateFromApi(record.dateTo),
        period: String(
          roundTo(
            (new Date(formatDateFromApi(record.dateTo)) - new Date(formatDateFromApi(record.dateFrom))) /
              (1000 * 60 * 60 * 24), 3
          )
        ),
        ...employeeQuickView
      })
    }
    fetchRecord()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.BenefitAcquisitions}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={EmployeeRepository.Employee.snapshot}
                    parameters={{ _startAt: 0, _branchId: 0 }}
                    name='employeeId'
                    label={labels.employee}
                    valueField='reference'
                    displayField='fullName'
                    valueShow='employeeRef'
                    secondValueShow='employeeName'
                    form={formik}
                    required
                    maxAccess={maxAccess}
                    displayFieldWidth={2}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'fullName', value: 'Name' }
                    ]}
                    onChange={async (_, newValue) => {
                      const employeeId = newValue?.recordId || null

                      const employeeQuickView = await fetchEmployeeQuickView(employeeId)
                      const benefitSchedule = !editMode && employeeId ? await resolveBenefitSchedule(employeeId) : {}

                      const periodAndRatio = calculatePeriodAndAqRatio({
                        employeeId,
                        benefitId: formik.values.benefitId,
                        bsId: !editMode ? benefitSchedule.bsId : formik.values.bsId,
                        dateFrom: formik.values.dateFrom,
                        dateTo: formik.values.dateTo,
                        amount: formik.values.amount
                      })

                      formik.setValues({
                        ...formik.values,
                        employeeId,
                        employeeName: newValue?.fullName || '',
                        employeeRef: newValue?.reference || '',
                        ...employeeQuickView,
                        ...(!editMode ? { bsId: benefitSchedule.bsId || null, bsName: benefitSchedule.bsName || '' } : {}),
                        ...periodAndRatio
                      })
                    }}
                    error={formik.touched.employeeId && Boolean(formik.errors.employeeId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='bsName'
                    label={labels.bsName}
                    value={formik.values.bsName}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={BenefitsRepository.ScheduleBenefits.qry}
                    parameters={`_bsId=${formik.values.bsId || 0}`}
                    name='benefitId'
                    label={labels.benefit}
                    valueField='benefitId'
                    displayField='benefitName'
                    values={formik.values}
                    required
                    readOnly={!formik.values.bsId}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      const benefitId = newValue?.benefitId || null

                      const periodAndRatio = calculatePeriodAndAqRatio({
                        employeeId: formik.values.employeeId,
                        benefitId,
                        bsId: formik.values.bsId,
                        dateFrom: formik.values.dateFrom,
                        dateTo: formik.values.dateTo,
                        amount: formik.values.amount
                      })

                      formik.setValues({
                        ...formik.values,
                        benefitId,
                        benefitName: newValue?.benefitName || '',
                        aqType: newValue?.aqType || null,
                        aqTypeName: newValue?.aqTypeName || '',
                        ...periodAndRatio
                      })
                    }}
                    error={formik.touched.benefitId && Boolean(formik.errors.benefitId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='aqDate'
                    label={labels.acquisitionDate}
                    value={formik.values.aqDate}
                    required
                    maxAccess={maxAccess}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('aqDate', null)}
                    error={formik.touched.aqDate && Boolean(formik.errors.aqDate)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='dateFrom'
                    label={labels.from}
                    value={formik.values.dateFrom}
                    required
                    maxAccess={maxAccess}
                    max={formik.values.dateTo}
                    onChange={(_, value) => {
                      const periodAndRatio = calculatePeriodAndAqRatio({
                        employeeId: formik.values.employeeId,
                        benefitId: formik.values.benefitId,
                        bsId: formik.values.bsId,
                        dateFrom: value,
                        dateTo: formik.values.dateTo,
                        amount: formik.values.amount
                      })

                      formik.setValues({ ...formik.values, dateFrom: value, ...periodAndRatio })
                    }}
                    onClear={() => {
                      formik.setFieldValue('dateFrom', null)
                      formik.setFieldValue('dateTo', null)
                    }}
                    error={formik.touched.dateFrom && Boolean(formik.errors.dateFrom)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='dateTo'
                    label={labels.to}
                    value={formik.values.dateTo}
                    required
                    readOnly={!formik.values.dateFrom}
                    maxAccess={maxAccess}
                    min={formik.values.dateFrom}
                    onChange={(_, value) => {
                      const periodAndRatio = calculatePeriodAndAqRatio({
                        employeeId: formik.values.employeeId,
                        benefitId: formik.values.benefitId,
                        bsId: formik.values.bsId,
                        dateFrom: formik.values.dateFrom,
                        dateTo: value,
                        amount: formik.values.amount
                      })

                      formik.setValues({ ...formik.values, dateTo: value, ...periodAndRatio })
                    }}
                    onClear={() => formik.setFieldValue('dateTo', null)}
                    error={formik.touched.dateTo && Boolean(formik.errors.dateTo)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='period'
                    label={labels.period}
                    value={formik.values.period}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='aqRatio'
                    label={labels.acquisitionRatio}
                    value={formik.values.aqRatio}
                    maxAccess={maxAccess}
                    decimalScale={3}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.IV_LOGISTICS_FUNCTIONS}
                    name='deliveryType'
                    label={labels.deliveryType}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    required
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('deliveryType', newValue?.key ?? null)
                    }}
                    error={formik.touched.deliveryType && Boolean(formik.errors.deliveryType)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='amount'
                    label={labels.amount}
                    value={formik.values.amount}
                    required
                    maxLength={8}
                    maxAccess={maxAccess}
                    decimalScale={0}
                    onChange={e => formik.setFieldValue('amount', e.target.value)}
                    onClear={() => formik.setFieldValue('amount', null)}
                    onBlur={() => {
                      const periodAndRatio = calculatePeriodAndAqRatio({
                        employeeId: formik.values.employeeId,
                        benefitId: formik.values.benefitId,
                        bsId: formik.values.bsId,
                        dateFrom: formik.values.dateFrom,
                        dateTo: formik.values.dateTo,
                        amount: formik.values.amount
                      })

                      formik.setValues({ ...formik.values, ...periodAndRatio })
                    }}
                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.FI_PV_GROUP_TYPE}
                    name='aqType'
                    label={labels.acquisitionType}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    readOnly
                    required
                    maxAccess={maxAccess}
                    error={formik.touched.aqType && Boolean(formik.errors.aqType)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='aqAmount'
                    label={labels.acquisitionAmount}
                    value={formik.values.aqAmount}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={BenefitsRepository.Settlement.qry}
                    parameters={`_employeeId=${formik.values.employeeId || 0}&_params=&_pageSize=1000&_startAt=0`}
                    name='settlementId'
                    label={labels.settlement}
                    valueField='recordId'
                    displayField='settlementRef'
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => formik.setFieldValue('settlementId', newValue?.recordId || null)}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='notes'
                    label={labels.notes}
                    value={formik.values.notes}
                    rows={3}
                    maxLength={255}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('notes', '')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='nationality'
                    label={labels.nationality}
                    value={formik.values.nationality}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='branchName'
                    label={labels.branch}
                    value={formik.values.branchName}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='departmentName'
                    label={labels.department}
                    value={formik.values.departmentName}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='positionName'
                    label={labels.position}
                    value={formik.values.positionName}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='hireDate'
                    label={labels.hireDate}
                    value={formik.values.hireDate}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='esName'
                    label={labels.employeeStatus}
                    value={formik.values.esName}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='loanBalance'
                    label={labels.loanBalance}
                    value={formik.values.loanBalance}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='divisionName'
                    label={labels.division}
                    value={formik.values.divisionName}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='reportToName'
                    label={labels.manager}
                    value={formik.values.reportToName}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='eosBalance'
                    label={labels.balance}
                    value={formik.values.eosBalance}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='serviceDuration'
                    label={labels.serviceDuration}
                    value={formik.values.serviceDuration}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}