// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import toast from 'react-hot-toast'

// ** Custom Imports
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import CustomTextField from 'src/components/Inputs/CustomTextField'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SelfServiceRepository } from 'src/repositories/SelfServiceRepository'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import TreeViewMultiSelection from 'src/views/components/tree-view/TreeViewMultiSelection'

import { DataSets } from 'src/resources/DataSets'

const PersonalSettings = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [initialValues, setInitialValues] = useState({
    recordId: null,
    email: null,
    activeStatus: null,
    userType: null,
    homePage: null,
    username: null,
    fullName: null,
    languageId: null,
    menuTheme: null
  })

  useEffect(() => {
    ;(async function () {
      try {
        
          //setIsLoading(true)

          const userData = window.sessionStorage.getItem('userData')
          ? JSON.parse(window.sessionStorage.getItem('userData'))
          : null;
          const _userId = userData && userData.userId;

          const res = await getRequest({
            extension: SelfServiceRepository.SSUserInfo.get,
            parameters: `_recordId=${_userId}`
          })

          setInitialValues(res.record)
        
      } catch (exception) {
      }

      //setIsLoading(false)
    })()
  }, [])

  const { labels: _labels, access } = useResourceQuery({
    datasetId: ResourceIds.PersonalSettings
  })

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues,
    onSubmit: values => {
        postPersonalSettings(values)
    }
  })

  const postPersonalSettings = obj => {
   
   /* var data = []
    Object.entries(obj).forEach(([key, value]) => {
      const newObj = { key: key, value: value }
      data.push(newObj)
    })*/
    
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

              //helperText={formik.touched.reference && formik.errors.reference}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.LANGUAGE}
              name='languageId'
              label={_labels.language}
              valueField='key'
              displayField='value'
              values={formik.values}
              required     
              onChange={(event, newValue) => {
                formik && formik.setFieldValue('languageId', newValue?.key)
              }}
              error={formik.touched.languageId && Boolean(formik.errors.languageId)}

              // helperText={formik.touched.mc_defaultRTSA && formik.errors.mc_defaultRTSA}
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

              // helperText={formik.touched.mc_defaultRTPU && formik.errors.mc_defaultRTPU}
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
        
      </Box>
    </>
  )
}

export default PersonalSettings
