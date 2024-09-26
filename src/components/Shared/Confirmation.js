import { Grid } from '@mui/material'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from './FormShell'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useState, useContext } from 'react'
import CustomComboBox from '../Inputs/CustomComboBox'
import { formatDateFromApi, formatDateToApiFunction } from 'src/lib/date-helper'
import { RequestsContext } from 'src/providers/RequestsContext'
import moment from 'moment-hijri'
import { idID } from '@mui/material/locale'

const Confirmation = ({ labels, formik, editMode, idTypeStore, maxAccess }) => {
  const [showAsPassword, setShowAsPassword] = useState(true)
  const [showAsPasswordRepeat, setShowAsPasswordRepeat] = useState(false)
  const { getMicroRequest } = useContext(RequestsContext)

  const handleCopy = event => {
    event.preventDefault()
  }

  const fetchFormik = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      idtId: formik.values?.idtId ? formik.values.idtId : formik.values?.id_type,
      birthDate: formik.values?.birthDate ? formik.values.birthDate : formik.values?.birth_date,
      idNo: formik.values?.idNo ? formik.values.idNo : formik.values?.id_number,
      idNoRepeat: ''
    },

    validationSchema: yup.object({
      birthDate: yup.string().required(),
      idtId: yup.string().required(),
      idNo: yup.string().required(),
      idNoRepeat: yup
        .string()
        .required('Repeat Password is required')
        .oneOf([yup.ref('idNo'), null], 'Number must match')
    }),
    onSubmit: values => {
      postFetchDefault(values)
    }
  })

  const postFetchDefault = obj => {
    let type
    if (obj.idtId === 28) {
      type = 1
    }
    if (obj.idtId === 26) {
      type = 2
    }

    const hijriDate = moment(formatDateToApiFunction(obj.birthDate), 'YYYY-MM-DD').format('iYYYY-iMM-iDD')

    const defaultParams = `_number=${obj.idNo}&_dateTime=${hijriDate}&_type=${type}`
    var parameters = defaultParams
    getMicroRequest({
      extension: 'getInformations',
      parameters: parameters
    })
      .then(res => {
        const dateObj = new Date(res?.idExpirationDate)
        const convertedTimestamp = dateObj.getTime() || ''

        formik.setValues({
          ...formik.values,
          expiryDate: convertedTimestamp,
          firstName: res.fl_firstName,
          middleName: res.fl_middleName,
          familyName: res.fl_familyName,
          lastName: res.fl_lastName,
          flName: res.flName,
          fl_firstName: res.firstName,
          fl_middleName: res.middleName,
          fl_lastName: res.lastName,
          fl_familyName: res.familyName,
          gender: res.gender === 'ذكر' ? '1' : '2'
        })
      })
      .catch(error => {})
  }

  return (
    <FormShell form={fetchFormik} maxAccess={maxAccess} editMode={editMode} infoVisible={false}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          {}
          <CustomComboBox
            name='idtId'
            label={labels.id_type}
            valueField='recordId'
            displayField='name'
            readOnly={true}
            store={idTypeStore}
            value={
              (fetchFormik.values?.idtId || fetchFormik.values?.id_type) &&
              idTypeStore.filter(item => item.recordId === (fetchFormik.values.idtId || fetchFormik.values.id_type))[0]
            }
            required
          />
        </Grid>
        <Grid item xs={12}>
          <CustomDatePicker
            name='birthDate'
            label={labels.birthDate}
            value={fetchFormik.values?.birthDate ? fetchFormik.values?.birthDate : fetchFormik.values?.birth_date}
            required={true}
            onChange={fetchFormik.setFieldValue}
            onClear={() => fetchFormik.setFieldValue('birthDate', '')}
            disabledDate={'>='}
            readOnly={true}
            error={fetchFormik.touched.birthDate && Boolean(fetchFormik.errors.birthDate)}
            helperText={fetchFormik.touched.birthDate && fetchFormik.errors.birthDate}
          />
        </Grid>

        <Grid item xs={12} sx={{ position: 'relative', width: '100%' }}>
          <CustomTextField
            sx={{ color: 'white' }}
            name='idNo'
            label={labels.id_number}
            type={showAsPassword && 'password'}
            value={fetchFormik.values?.idNo ? fetchFormik.values?.idNo : fetchFormik.values?.id_number}
            required
            onChange={e => {
              fetchFormik.handleChange(e)
            }}
            onCopy={handleCopy}
            onPaste={handleCopy}
            readOnly={true}
            maxLength='15'
            onBlur={e => {
              setShowAsPassword(true)
            }}
            onFocus={e => {
              setShowAsPassword(false)
            }}
            onClear={() => {
              fetchFormik.setFieldValue('idNo', '')
            }}
            error={fetchFormik.touched.idNo && Boolean(fetchFormik.errors.idNo)}
            helperText={fetchFormik.touched.idNo && fetchFormik.errors.idNo}
          />
        </Grid>

        <Grid item xs={12} sx={{ position: 'relative', width: '100%' }}>
          <CustomTextField
            name='idNoRepeat'
            label={labels.confirmIdNumber}
            value={fetchFormik.values?.idNoRepeat}
            required
            type={showAsPasswordRepeat && 'password'}
            onChange={e => {
              fetchFormik.handleChange(e)
            }}
            onCopy={handleCopy}
            onPaste={handleCopy}
            readOnly={editMode && true}
            onBlur={e => {
              setShowAsPasswordRepeat(true), fetchFormik.handleBlur(e)
            }}
            onFocus={e => {
              setShowAsPasswordRepeat(false)
            }}
            maxLength='15'
            onClear={() => {
              fetchFormik.setFieldValue('idNoRepeat', '')
            }}
            error={fetchFormik.touched.idNoRepeat && Boolean(fetchFormik.errors.idNoRepeat)}
            helperText={fetchFormik.touched.idNoRepeat && fetchFormik.errors.idNoRepeat}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}

export default Confirmation
