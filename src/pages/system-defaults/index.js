import { useEffect, useState, useContext } from 'react'
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import * as yup from 'yup'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useResourceQuery } from 'src/hooks/resource'
import { DataSets } from 'src/resources/DataSets'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'

const SystemDefaults = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [initialValues, setInitialValues] = useState({
    extentionsPath: '',
    baseCurrencyId: null,
    countryId: null,
    vatPct: null,
    dateFormat: null,
    timeZone: null,
    backofficeEmail: '',
    enableHijri: false
  })
  const editMode = initialValues.baseCurrencyId ? true : false

  useEffect(() => {
    getDataResult()
  }, [])

  const getDataResult = () => {
    const myObject = {}
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Defaults.qry,
      parameters: parameters
    })
      .then(res => {
        const filteredList = res.list.filter(obj => {
          return (
            obj.key === 'baseCurrencyId' ||
            obj.key === 'countryId' ||
            obj.key === 'vatPct' ||
            obj.key === 'timeZone' ||
            obj.key === 'enableHijri' ||
            obj.key === 'extentionsPath' ||
            obj.key === 'backofficeEmail' ||
            obj.key === 'dateFormat'
          )
        })
        filteredList.forEach(obj => {
          myObject[obj.key] =
            obj.key === 'baseCurrencyId' || obj.key === 'countryId' || obj.key === 'vatPct' || obj.key === 'timeZone'
              ? obj.value
                ? parseInt(obj.value)
                : null
              : obj.key === 'enableHijri'
              ? obj.value
                ? obj.value
                : false
              : obj.value
              ? obj.value
              : null
        })

        setInitialValues(myObject)
      })
      .catch(error => {})
  }

  const { labels: _labels, access } = useResourceQuery({
    datasetId: ResourceIds.SystemDefaults
  })

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues,
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
      record: JSON.stringify({ sysDefaults: data })
    })
      .then(res => {
        if (res) toast.success('Record Successfully')
      })
      .catch(error => {})
  }

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={5} sx={{ pl: '10px', pt: '10px' }} lg={4} md={7} sm={7} xs={12}>
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
                if (newValue) {
                  formik.setFieldValue('baseCurrencyId', newValue?.recordId)
                } else {
                  formik.setFieldValue('baseCurrencyId', '')
                }
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
                if (newValue) {
                  formik.setFieldValue('countryId', newValue?.recordId)
                } else {
                  formik.setFieldValue('countryId', '')
                }
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
                if (newValue) {
                  formik.setFieldValue('timeZone', newValue?.recordId)
                } else {
                  formik.setFieldValue('timeZone', '')
                }
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
                if (newValue) {
                  formik.setFieldValue('dateFormat', newValue?.key)
                } else {
                  formik.setFieldValue('dateFormat', '')
                }
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
      <Fixed>
        <WindowToolbar onSave={formik.handleSubmit} isSaved={true} />
      </Fixed>
    </VertLayout>
  )
}

export default SystemDefaults
