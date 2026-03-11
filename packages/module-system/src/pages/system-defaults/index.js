import { useEffect, useContext } from 'react'
import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

const SystemDefaults = () => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults, updateSystemDefaults } = useContext(DefaultsContext)

  useEffect(() => {
    if (!systemDefaults?.list?.length) return
    getDataResult()
  }, [systemDefaults])

  const getDataResult = () => {
    const myObject = {}

    const filteredList = systemDefaults?.list?.filter(obj => {
      return (
        obj.key === 'baseCurrencyId' ||
        obj.key === 'countryId' ||
        obj.key === 'vatPct' ||
        obj.key === 'timeZone' ||
        obj.key === 'enableHijri' ||
        obj.key === 'backofficeEmail' ||
        obj.key === 'dateFormat' ||
        obj.key === 'ActivityBlankQryDaysBack' ||
        obj.key === 'extentionsPath' ||
        obj.key === 'passwordExpiryDays' ||
        obj.key === 'postalZone' ||
        obj.key === 'cityName' ||
        obj.key === 'buildingNumber' ||
        obj.key === 'streetName' ||
        obj.key === 'citySubdivisionName'
      )
    })

    filteredList?.forEach(obj => {
      const isStringLike =
        obj.key === 'dateFormat' ||
        obj.key === 'backofficeEmail' ||
        obj.key === 'enableHijri' ||
        obj.key === 'extentionsPath' ||
        obj.key === 'postalZone' ||
        obj.key === 'cityName' ||
        obj.key === 'buildingNumber' ||
        obj.key === 'streetName' ||
        obj.key === 'citySubdivisionName'

      if (isStringLike) {
        myObject[obj.key] = obj.value || ''
      } else {
        myObject[obj.key] = obj.value ? parseInt(obj.value, 10) : null
      }
    })
    formik.setValues(myObject)
  }

  const { labels: _labels, access } = useResourceQuery({
    datasetId: ResourceIds.SystemDefaults
  })

  const formik = useFormik({
    validateOnChange: true,
    initialValues: {
      extentionsPath: '',
      baseCurrencyId: null,
      ActivityBlankQryDaysBack: '',
      countryId: null,
      vatPct: null,
      dateFormat: null,
      timeZone: null,
      backofficeEmail: '',
      enableHijri: false,
      passwordExpiryDays: null,
      postalZone: '',
      cityName: '',
      buildingNumber: '',
      streetName: '',
      citySubdivisionName: ''
    },
    validationSchema: yup.object({
      baseCurrencyId: yup.string().required(' '),
      vatPct: yup.number().min(0, 'min').max(100, 'max')
    }),
    onSubmit: values => {
      postSystemDefaults(values)
    }
  })

  const postSystemDefaults = obj => {
    var data = []
    Object.entries(obj).forEach(([key, value]) => {
      const newObj = { key: key, value: value }
      data.push(newObj)
    })
    postRequest({
      extension: SystemRepository.Defaults.set,
      record: JSON.stringify({ SysDefaults: data })
    }).then(res => {
      if (res) toast.success(platformLabels.Edited)
      updateSystemDefaults(data)
    })
  }
  const editMode = formik.values.baseCurrencyId ? true : false

  return (
    <FormShell
      resourceId={ResourceIds.SystemDefaults}
      form={formik}
      maxAccess={access}
      isInfo={false}
      isSavedClear={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={5}>
            <Grid item xs={12} md={6}>
              <Grid container spacing={5}>
                <Grid item xs={12}>
                  <CustomTextField
                    name='extentionsPath'
                    label={_labels.extentionsPath}
                    value={formik.values.extentionsPath}
                    maxAccess={access}
                    maxLength='30'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('extentionsPath', '')}
                    error={formik.touched.extentionsPath && Boolean(formik.errors.extentionsPath)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Currency.qry}
                    name='baseCurrencyId'
                    label={_labels.baseCurrencyId}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    required
                    values={formik.values}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField='name'
                    maxAccess={access}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('baseCurrencyId', newValue?.recordId || null)
                    }}
                    error={formik.touched.baseCurrencyId && Boolean(formik.errors.baseCurrencyId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Country.qry}
                    name='countryId'
                    label={_labels.countryId}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField='name'
                    maxAccess={access}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('countryId', newValue?.recordId || null)
                    }}
                    error={formik.touched.countryId && Boolean(formik.errors.countryId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='vatPct'
                    label={_labels.vatPct}
                    value={formik.values.vatPct}
                    numberField={true}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('vatPct', null)}
                    error={formik.touched.vatPct && Boolean(formik.errors.vatPct)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.TimeZone}
                    name='timeZone'
                    label={_labels.timeZone}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    maxAccess={access}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('timeZone', newValue?.key || null)
                    }}
                    error={formik.touched.timeZone && Boolean(formik.errors.timeZone)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.DateFormat}
                    name='dateFormat'
                    label={_labels.dateFormat}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    maxAccess={access}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('dateFormat', newValue?.key || null)
                    }}
                    error={formik.touched.dateFormat && Boolean(formik.errors.dateFormat)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='backofficeEmail'
                    label={_labels.backofficeEmail}
                    value={formik.values.backofficeEmail}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('backofficeEmail', '')}
                    error={formik.touched.backofficeEmail && Boolean(formik.errors.backofficeEmail)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.OUTER_GRID_DAYS}
                    name='ActivityBlankQryDaysBack'
                    label={_labels.outerGrid}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    maxAccess={access}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('ActivityBlankQryDaysBack', newValue?.key || '')
                    }}
                    error={formik.touched.ActivityBlankQryDaysBack && Boolean(formik.errors.ActivityBlankQryDaysBack)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomCheckBox
                    name='enableHijri'
                    value={formik.values?.enableHijri}
                    onChange={event => formik.setFieldValue('enableHijri', event.target.checked)}
                    label={_labels.enableHijri}
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='passwordExpiryDays'
                    label={_labels.passwordExpiryDays}
                    value={formik.values?.passwordExpiryDays}
                    maxAccess={access}
                    onChange={formik.handleChange}
                    decimalScale={0}
                    maxLength={4}
                    onClear={() => formik.setFieldValue('passwordExpiryDays', null)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={5}>
                <Grid item xs={12}>
                  <CustomTextField
                    name='postalZone'
                    label={_labels.postalZone}
                    value={formik.values.postalZone}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('postalZone', '')}
                    error={formik.touched.postalZone && Boolean(formik.errors.postalZone)}
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='cityName'
                    label={_labels.cityName}
                    value={formik.values.cityName}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('cityName', '')}
                    error={formik.touched.cityName && Boolean(formik.errors.cityName)}
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='buildingNumber'
                    label={_labels.buildingNumber}
                    value={formik.values.buildingNumber}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('buildingNumber', '')}
                    error={formik.touched.buildingNumber && Boolean(formik.errors.buildingNumber)}
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='streetName'
                    label={_labels.streetName}
                    value={formik.values.streetName}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('streetName', '')}
                    error={formik.touched.streetName && Boolean(formik.errors.streetName)}
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='citySubdivisionName'
                    label={_labels.citySubdivisionName}
                    value={formik.values.citySubdivisionName}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('citySubdivisionName', '')}
                    error={formik.touched.citySubdivisionName && Boolean(formik.errors.citySubdivisionName)}
                    maxAccess={access}
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

export default SystemDefaults
