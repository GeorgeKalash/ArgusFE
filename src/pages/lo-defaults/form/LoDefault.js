import { useEffect, useState, useContext } from 'react'
import { Grid } from '@mui/material'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

const LoDefault = ({ _labels, access }) => {
  const [errorMessage, setErrorMessage] = useState(null)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [initialValues, setInitialValues] = useState({
    transitSiteId: null,
    lo_min_car_amount: null
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
        console.log(res)

        const filteredList = res.list.filter(obj => {
          return obj.key === 'transitSiteId' || obj.key === 'lo_min_car_amount'
        })
        filteredList.forEach(obj => (myObject[obj.key] = obj.value ? parseInt(obj.value) : null))
        setInitialValues(myObject)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues,
    onSubmit: values => {
      postLoDefault(values)
    }
  })

  const postLoDefault = obj => {
    var data = []
    Object.entries(obj).forEach(([key, value]) => {
      const newObj = { key: key, value: value }
      data.push(newObj)
    })
    postRequest({
      extension: SystemRepository.Defaults.set,
      record: JSON.stringify({ SysDefaults: data })
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
        <Grid container spacing={4} sx={{ pt: '0.5rem' }}>
          <Grid item xs={12} sx={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}>
            <ResourceComboBox
              endpointId={InventoryRepository.Site.qry}
              name='transitSiteId'
              label={_labels.carrierSite}
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
                  formik.setFieldValue('transitSiteId', newValue?.recordId)
                } else {
                  formik.setFieldValue('transitSiteId', '')
                }
              }}
              error={formik.touched.transitSiteId && Boolean(formik.errors.transitSiteId)}
            />
          </Grid>
          <Grid item xs={12} sx={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}>
            <CustomNumberField
              onClear={() => formik.setFieldValue('lo_min_car_amount', '')}
              name='lo_min_car_amount'
              onChange={formik.handleChange}
              label={_labels.mca}
              value={formik.values.lo_min_car_amount}
              error={formik.touched.lo_min_car_amount && Boolean(formik.errors.lo_min_car_amount)}
            />
          </Grid>
        </Grid>
      </Grow>
      <Fixed>
        <WindowToolbar onSave={handleSubmit} isSaved={true} />
      </Fixed>
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </VertLayout>
  )
}

export default LoDefault
