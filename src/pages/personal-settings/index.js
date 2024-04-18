import { useEffect, useState, useContext } from 'react'
import { Grid, Box } from '@mui/material'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SelfServiceRepository } from 'src/repositories/SelfServiceRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useResourceQuery } from 'src/hooks/resource'
import { DataSets } from 'src/resources/DataSets'
import * as yup from 'yup'

const PersonalSettings = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [initialValues, setInitialValues] = useState({
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
  })

  useEffect(() => {
    ;(async function () {
      try {
          const userData = window.sessionStorage.getItem('userData')
          ? JSON.parse(window.sessionStorage.getItem('userData'))
          : null;
          const _userId = userData && userData.userId;

          const res = await getRequest({
            extension: SelfServiceRepository.SSUserInfo.get,
            parameters: `_recordId=${_userId}`
          })

          setInitialValues(res.record)
        
      } catch (exception) {}
    })()
  }, [])

  const { labels: _labels } = useResourceQuery({
    datasetId: ResourceIds.PersonalSettings
  })

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues,
    validationSchema: yup.object({
      fullName: yup.string().required(' '),
      languageId: yup.string().required(' ')
    }),
    onSubmit: values => {
        postPersonalSettings(values)
    }
  })
  
  const postPersonalSettings = obj => {
   
    postRequest({
      extension: SelfServiceRepository.SSUserInfo.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        if (res) toast.success('Record Added Successfully')
      })
  }

  const handleSubmit = () => {
    formik.handleSubmit()
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          marginTop: '10px'
        }}
      >
        <Grid container spacing={5} sx={{ pl: '10px' }} lg={4} md={7} sm={7} xs={12}>
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
                formik && formik.setFieldValue('languageId', newValue?.key ?? '')
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
                formik && formik.setFieldValue('menuTheme', newValue?.key)
              }}
              error={formik.touched.menuTheme && Boolean(formik.errors.menuTheme)}
            />
          </Grid>
          <Grid
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              width: '100%',
              padding: 3,
              textAlign: 'center'
            }}
          >
            <WindowToolbar onSave={handleSubmit} isSaved={true} />
          </Grid>
        </Grid>
        <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
      </Box>
    </>
  )
}

export default PersonalSettings
