import { useEffect, useState, useContext } from 'react'
import { Grid, Box } from '@mui/material'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { DataSets } from 'src/resources/DataSets'
import { SystemFunction } from 'src/resources/SystemFunction'

import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'

const MFSettings = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [initialValues, setInitialValues] = useState({
    mf_mu: null,
    mf_lean_dtId: null,
    mf_lean_siteId: null
  })

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
          return obj.key === 'mf_mu' || obj.key === 'mf_lean_dtId' || obj.key === 'mf_lean_siteId'
        })
        filteredList.forEach(obj => (myObject[obj.key] = obj.value ? parseInt(obj.value) : null))
        setInitialValues(myObject)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const { labels: _labels, access } = useResourceQuery({
    datasetId: ResourceIds.MF_Settings
  })

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues,
    onSubmit: values => {
      postMFSettings(values)
    }
  })

  const postMFSettings = obj => {
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
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const handleSubmit = () => {
    formik.handleSubmit()
  }

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={5} sx={{ pl: '10px', pt: '10px' }} lg={3} md={7} sm={7} xs={12}>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.POS_GRID_COL_OPTIONS}
              name='mf_mu'
              label={_labels.measurementUnit}
              valueField='key'
              displayField='value'
              values={formik.values}
              filter={item => item.key === '1'}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('mf_mu', newValue?.key)
                } else {
                  formik.setFieldValue('mf_mu', '')
                }
              }}
              error={formik.touched.mf_mu && Boolean(formik.errors.mf_mu)}
              helperText={formik.touched.mf_mu && formik.errors.mf_mu}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={SystemRepository.DocumentType.qry}
              parameters={`_dgId=${SystemFunction.LeanProduction}&_startAt=0&_pageSize=1000`}
              name='mf_lean_dtId'
              label={_labels.documentType}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('mf_lean_dtId', newValue?.recordId)
                } else {
                  formik.setFieldValue('mf_lean_dtId', '')
                }
              }}
              error={formik.touched.mf_lean_dtId && Boolean(formik.errors.mf_lean_dtId)}
              helperText={formik.touched.mf_lean_dtId && formik.errors.mf_lean_dtId}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={InventoryRepository.Site.qry}
              name='mf_lean_siteId'
              label={_labels.site}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('mf_lean_siteId', newValue?.recordId)
                } else {
                  formik.setFieldValue('mf_lean_siteId', '')
                }
              }}
              error={formik.touched.mf_lean_siteId && Boolean(formik.errors.mf_lean_siteId)}
              helperText={formik.touched.mf_lean_siteId && formik.errors.mf_lean_siteId}
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
      </Grow>

      <Fixed>
        {' '}
        <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
      </Fixed>
    </VertLayout>
  )
}

export default MFSettings
