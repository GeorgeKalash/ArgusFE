import { useEffect, useContext } from 'react'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SelfServiceRepository } from '@argus/repositories/src/repositories/SelfServiceRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import * as yup from 'yup'
import { getStorageData } from '@argus/shared-domain/src/storage/storage'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import i18n from '@argus/shared-configs/src/configs/i18n'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const PersonalSettings = ({ _labels, access }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  useEffect(() => {
    ;(async function () {
      const userData = getStorageData('userData')
      const _userId = userData.userId

      const res = await getRequest({
        extension: SelfServiceRepository.SSUserInfo.get,
        parameters: `_recordId=${_userId}`
      })

      formik.setValues(res.record)
    })()
  }, [])

  const { formik } = useForm({
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
      fullName: yup.string().required(),
      languageId: yup.string().required()
    }),
    onSubmit: async values => {
      await postPersonalSettings(values)
    }
  })

  const postPersonalSettings = async obj => {
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

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='fullName'
                label={_labels.name}
                value={formik.values.fullName}
                required
                maxAccess={access}
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
                maxAccess={access}
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
                maxAccess={access}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('menuTheme', newValue?.key)
                }}
                error={formik.touched.menuTheme && Boolean(formik.errors.menuTheme)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default PersonalSettings
