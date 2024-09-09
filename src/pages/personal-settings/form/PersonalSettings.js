import { useEffect, useState, useContext } from 'react'
import { Grid, Box } from '@mui/material'
import toast from 'react-hot-toast'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SelfServiceRepository } from 'src/repositories/SelfServiceRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import useResourceParams from 'src/hooks/useResourceParams'
import { DataSets } from 'src/resources/DataSets'
import * as yup from 'yup'
import { getStorageData } from 'src/storage/storage'
import { useForm } from 'src/hooks/form'
import i18n from 'src/configs/i18n'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const PersonalSettings = ({ _labels }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  useEffect(() => {
    ;(async function () {
      try {
        const userData = getStorageData('userData')
        const _userId = userData.userId

        const res = await getRequest({
          extension: SelfServiceRepository.SSUserInfo.get,
          parameters: `_recordId=${_userId}`
        })

        formik.setValues(res.record)
      } catch (exception) {}
    })()
  }, [])

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      recordId: null,
      email: '',
      activeStatus: '',
      userType: '',
      homePage: '',
      username: '',
      fullName: '',
      languageId: '',
      menuTheme: '',
      languageName: ''
    },
    validationSchema: yup.object({
      fullName: yup.string().required(' '),
      languageId: yup.string().required(' ')
    }),
    onSubmit: async values => {
      await postPersonalSettings(values)
    }
  })

  const postPersonalSettings = async obj => {
    try {
      await postRequest({
        extension: SelfServiceRepository.SSUserInfo.set,
        record: JSON.stringify(obj)
      })
      toast.success('Record Success')

      window.localStorage.setItem('languageId', obj.languageId)

      const currentSettings = JSON.parse(window.localStorage.getItem('settings')) || {}
      changeLang(obj.languageId)

      const newSettings = {
        ...currentSettings,
        direction: obj.languageId == 2 ? 'rtl' : 'ltr'
      }

      window.localStorage.setItem('settings', JSON.stringify(newSettings))
    } catch (error) {}
  }

  const changeLang = id => {
    switch (id) {
      case 1:
        i18n.changeLanguage('en')
        break
      case 2:
        i18n.changeLanguage('ar')
        break
      case 3:
        i18n.changeLanguage('fr')
        break

      default:
        break
    }
  }

  const handleSubmit = () => {
    formik.handleSubmit()
  }

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={3} sx={{ pl: '10px', pt: '10px', pr: '10px' }}>
          <Grid item xs={12}>
            <CustomTextField
              name='fullName'
              label={_labels.name}
              value={formik.values.fullName}
              required
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('fullName', '')}
              error={formik.touched.fullName && Boolean(formik.errors.fullName)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.LANGUAGE}
              name='languageId'
              label={_labels.lang}
              valueField='key'
              displayField='value'
              values={formik.values}
              required
              onChange={(event, newValue) => {
                formik.setFieldValue('languageId', newValue?.key ?? '')
              }}
              error={formik.touched.languageId && Boolean(formik.errors.languageId)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.MENU_THEME}
              name='menuTheme'
              label={_labels.menuTheme}
              valueField='key'
              displayField='value'
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('menuTheme', newValue?.key)
              }}
              error={formik.touched.menuTheme && Boolean(formik.errors.menuTheme)}
            />
          </Grid>
          <Grid bottom={0} left={0} width='100%' position='fixed'>
            <WindowToolbar onSave={handleSubmit} isSaved={true} />
          </Grid>
        </Grid>
      </Grow>
    </VertLayout>
  )
}

export default PersonalSettings
