import { Grid } from '@mui/material'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import * as yup from 'yup'
import FormShell from './FormShell'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useState, useContext } from 'react'
import { formatDateForGetApI, formatDateFromApi } from 'src/lib/date-helper'
import { RequestsContext } from 'src/providers/RequestsContext'
import moment from 'moment-hijri'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { VertLayout } from './Layouts/VertLayout'
import { Grow } from './Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { useError } from 'src/error'

const Confirmation = ({ labels, clientformik, editMode, maxAccess, idTypes, refreshProf = () => {}, window }) => {
  const [showAsPassword, setShowAsPassword] = useState(true)
  const [showAsPasswordRepeat, setShowAsPasswordRepeat] = useState(false)
  const { getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()

  const handleCopy = event => {
    event.preventDefault()
  }

  const { formik } = useForm({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      idtId: clientformik.values?.idtId ? clientformik.values.idtId : clientformik.values?.id_type?.recordId,
      birthDate: clientformik.values?.birthDate,
      idNo: clientformik.values?.idNo,
      idNoRepeat: ''
    },

    validationSchema: yup.object({
      birthDate: yup.string().required(),
      idtId: yup.string().required(),
      idNo: yup.string().required(),
      idNoRepeat: yup
        .string()
        .required()
        .oneOf([yup.ref('idNo'), null], 'Number must match')
    }),
    onSubmit: values => {
      postFetchDefault(values)
    }
  })

  const postFetchDefault = obj => {
    const type =
      idTypes?.list?.filter(item => item?.recordId == obj?.idtId)?.[0]?.type || clientformik.values?.id_type?.type

    const hijriDate = moment(formatDateForGetApI(obj.birthDate), 'YYYY-MM-DD').format('iYYYY-iMM-iDD')

    const defaultParams = `_number=${obj.idNo}&_date=${hijriDate}&_yakeenType=${type}`
    var parameters = defaultParams
    getRequest({
      extension: CurrencyTradingSettingsRepository.Yakeen.get,
      parameters: parameters
    }).then(result => {
      const res = result.record

      if (!res.errorId) {
        clientformik.setFieldValue('expiryDate', formatDateFromApi(res.idExpirationDate))
        clientformik.setFieldValue('firstName', res.fl_firstName)
        clientformik.setFieldValue('middleName', res.fl_middleName)
        clientformik.setFieldValue('familyName', res.fl_familyName)
        clientformik.setFieldValue('lastName', res.fl_lastName)
        clientformik.setFieldValue('flName', res.flName)
        clientformik.setFieldValue('fl_firstName', res.firstName)
        clientformik.setFieldValue('fl_middleName', res.middleName)
        clientformik.setFieldValue('fl_lastName', res.lastName)
        clientformik.setFieldValue('fl_familyName', res.familyName)
        clientformik.setFieldValue('gender', res.gender === 'ذكر' ? '1' : '2')
        clientformik.setFieldValue('professionId', res.professionId)
        clientformik.setFieldValue('nationalityId', res.nationalityId)
        clientformik.setFieldValue('idIssuePlaceCode', res.idIssuePlaceCode)
        clientformik.setFieldValue('sponsorName', res.sponsorName)

        res.newProfessionMode && refreshProf()
        window.close()
      } else {
        stackError({ message: JSON.stringify(res?.errorDetail) })
      }
    })
  }

  return (
    <FormShell form={formik} maxAccess={maxAccess} editMode={editMode} isCleared={false} infoVisible={false}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='idTypeName'
                label={labels.id_type}
                readOnly={true}
                value={
                  idTypes?.list?.find(item => item.recordId === formik.values.idtId)?.name ||
                  clientformik.values?.id_type?.name
                }
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='birthDate'
                label={labels.birthDate}
                value={formik.values?.birthDate ? formik.values?.birthDate : formik.values?.birth_date}
                required={true}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('birthDate', '')}
                disabledDate={'>='}
                readOnly={true}
                error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
                helperText={formik.touched.birthDate && formik.errors.birthDate}
              />
            </Grid>

            <Grid item xs={12} sx={{ position: 'relative', width: '100%' }}>
              <CustomTextField
                sx={{ color: 'white' }}
                name='idNo'
                label={labels.id_number}
                type={showAsPassword && 'password'}
                value={formik.values?.idNo ? formik.values?.idNo : formik.values?.id_number}
                required
                onChange={e => {
                  formik.handleChange(e)
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
                  formik.setFieldValue('idNo', '')
                }}
                error={formik.touched.idNo && Boolean(formik.errors.idNo)}
                helperText={formik.touched.idNo && formik.errors.idNo}
              />
            </Grid>

            <Grid item xs={12} sx={{ position: 'relative', width: '100%' }}>
              <CustomTextField
                name='idNoRepeat'
                label={labels.confirmIdNumber}
                value={formik.values?.idNoRepeat}
                required
                type={showAsPasswordRepeat && 'password'}
                onChange={e => {
                  formik.handleChange(e)
                }}
                onCopy={handleCopy}
                onPaste={handleCopy}
                readOnly={editMode && true}
                onBlur={e => {
                  setShowAsPasswordRepeat(true), formik.handleBlur(e)
                }}
                onFocus={e => {
                  setShowAsPasswordRepeat(false)
                }}
                maxLength='15'
                onClear={() => {
                  formik.setFieldValue('idNoRepeat', '')
                }}
                error={formik.touched.idNoRepeat && Boolean(formik.errors.idNoRepeat)}
                helperText={formik.touched.idNoRepeat && formik.errors.idNoRepeat}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default Confirmation
