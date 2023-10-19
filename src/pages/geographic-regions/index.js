// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, Button } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { getNewGeographicRegion, populateGeographicRegions } from 'src/Models/System/GeographicRegions'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'

const GeographicRegions = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  //stores
  const [gridData, setGridData] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [errorMessage, setErrorMessage] = useState(null)

  const columns = [
    {
      field: 'reference',
      headerName: 'Reference',
      flex: 1
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1
    }
  ]

  const geographicRegionsValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,

    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postGeographicRegion(values)
    }
  })

  const handleSubmit = () => {
    if (activeTab === 0) geographicRegionsValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams

    getRequest({
      extension: SystemRepository.GeographicRegion.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData({ ...res, _startAt })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postGeographicRegion = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: SystemRepository.GeographicRegion.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        setWindowOpen(false)
        if (!recordId) toast.success('Record Added Successfully')
        else toast.success('Record Edited Successfully')
      })
      .catch(error => {
        console.log({ error })
        setErrorMessage(error)
      })
  }

  const delGeographicRegion = obj => {
    postRequest({
      extension: SystemRepository.GeographicRegion.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        console.log({ res })
        getGridData({})
        toast.success('Record Deleted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addGeographicRegion = () => {
    geographicRegionsValidation.setValues(getNewGeographicRegion())
    setEditMode(false)
    setWindowOpen(true)
  }

  const editGeographicRegion = obj => {
    geographicRegionsValidation.setValues(populateGeographicRegions(obj))
    setEditMode(true)
    setWindowOpen(true)
  }

  useEffect(() => {
    getGridData({ _startAt: 0, _pageSize: 30 })
  }, [])

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <GridToolbar onAdd={addGeographicRegion} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editGeographicRegion}
          onDelete={delGeographicRegion}
          isLoading={false}
          pageSize={30}
        />
      </Box>
      {windowOpen && (
        <Window
          id='GeographicRegionWindow'
          Title='Geographic Regions'
          onClose={() => setWindowOpen(false)}
          width={500}
          height={300}
          onSave={handleSubmit}
        >
          <CustomTabPanel index={0} value={activeTab}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <CustomTextField
                  name='reference'
                  label='Reference'
                  value={geographicRegionsValidation.values.reference}
                  required
                  readOnly={editMode}
                  onChange={geographicRegionsValidation.handleChange}
                  onClear={() => geographicRegionsValidation.setFieldValue('reference', '')}
                  error={
                    geographicRegionsValidation.touched.reference &&
                    Boolean(geographicRegionsValidation.errors.reference)
                  }
                  helperText={
                    geographicRegionsValidation.touched.reference && geographicRegionsValidation.errors.reference
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='name'
                  label='Name'
                  value={geographicRegionsValidation.values.name}
                  required
                  onChange={geographicRegionsValidation.handleChange}
                  onClear={() => geographicRegionsValidation.setFieldValue('name', '')}
                  error={geographicRegionsValidation.touched.name && Boolean(geographicRegionsValidation.errors.name)}
                  helperText={geographicRegionsValidation.touched.name && geographicRegionsValidation.errors.name}
                />
              </Grid>
            </Grid>
          </CustomTabPanel>
        </Window>
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default GeographicRegions
