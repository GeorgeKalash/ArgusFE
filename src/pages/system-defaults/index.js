import { useEffect, useState, useContext } from 'react'
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import * as yup from 'yup'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useResourceQuery } from 'src/hooks/resource'
import { DataSets } from 'src/resources/DataSets'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import FormShell from 'src/components/Shared/FormShell'

const SystemDefaults = () => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)

  useEffect(() => {
    getDataResult()
  }, [])

  const getDataResult = () => {
    const myObject = {}

    const filteredList = defaultsData?.list?.filter(obj => {
      return (
        obj.key === 'baseCurrencyId' ||
        obj.key === 'countryId' ||
        obj.key === 'vatPct' ||
        obj.key === 'timeZone' ||
        obj.key === 'enableHijri' ||
        obj.key === 'backofficeEmail' ||
        obj.key === 'dateFormat' ||
        obj.key === 'ActivityBlankQryDaysBack' ||
        obj.key === 'extentionsPath'
      )
    })
    filteredList?.forEach(obj => {
      if (obj.key === 'dateFormat' || obj.key === 'backofficeEmail') {
        myObject[obj.key] = obj.value || null
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
    enableReinitialize: true,
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
      enableHijri: false
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
      updateDefaults(data)
    })
  }

  const editMode = formik.values.baseCurrencyId ? true : false

  return (
    <FormShell
      resourceId={ResourceIds.SystemDefaults}
      form={formik}
      maxAccess={access}
      infoVisible={false}
      isSavedClear={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={5} lg={5}>
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
              <CustomTextField
                name='vatPct'
                label={_labels.vatPct}
                value={formik.values.vatPct}
                type='numeric'
                numberField={true}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('vatPct', '')}
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
              <FormControlLabel
                control={
                  <Checkbox
                    name='enableHijri'
                    maxAccess={access}
                    checked={formik.values?.enableHijri}
                    onChange={event => {
                      formik.setFieldValue('enableHijri', event.target.checked)
                    }}
                  />
                }
                label={_labels.enableHijri}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default SystemDefaults
