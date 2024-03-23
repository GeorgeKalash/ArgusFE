// ** MUI Imports
import { Grid, Box } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useEffect, useState } from 'react'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'

const ProductFieldTab = ({ dispersalStore, maxAccess }) => {
  //stores
  const [gridData, setGridDate ] = useState()

  useEffect(()=>{
    getProductFieldGridData('')
  }, [])

  const getProductFieldGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const newData = {
      list: [
        {
          recordId: 1,
          controls: 'beneficiary',
          format: 'Alpha',
          securityLevel: 'Mandatory',
          specialChars: '@',
          fixedLength: 20,
          minLength: 3,
          maxLength: 20
        },
        {
          recordId: 2,
          controls: 'phone',
          format: 'Alpha',
          securityLevel: 'readOnly',
          specialChars: '@',
          fixedLength: 10,
          minLength: 3,
          maxLength: 10
        },
        {
          recordId: 3,
          controls: 'email',
          format: 'Alpha+SP',
          securityLevel: 'Optional',
          specialChars: '@',
          fixedLength: 10,
          minLength: 3,
          maxLength: 10
        },
        {
          recordId: 4,
          controls: 'Country',
          format: 'Numeric',
          securityLevel: 'Mandatory',
          specialChars: '@',
          fixedLength: 10,
          minLength: 3,
          maxLength: 10
        },
        {
          recordId: 5,
          controls: 'City',
          format: 'Alpha Numeric',
          securityLevel: 'hidden',
          specialChars: '@',
          fixedLength: 10,
          minLength: 3,
          maxLength: 10
        }
      ]
    }
    setGridDate({ ...newData })
  }

  const columns = [
    {
      field: 'controls',
      headerName: 'Controls',
      flex: 1
    },
    {
      field: 'format',
      headerName: 'Format',
      flex: 1
    },
    {
      field: 'securityLevel',
      headerName: 'securityLevel',
      flex: 1
    },
    {
      field: 'specialChars',
      headerName: 'special Chars',
      flex: 1
    },
    {
      field: 'fixedLength',
      headerName: 'fixed Length',
      flex: 1
    },
    {
      field: 'minLength',
      headerName: 'min Length',
      flex: 1
    },
    {
      field: 'maxLength',
      headerName: 'max Length',
      flex: 1
    }
  ]

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <Grid container gap={2}>
          <Grid container xs={12} spacing={2}>
            <Grid item xs={6}>
              <CustomTextField label='Reference' value={''} readOnly={true} />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField label='Name' value={''} readOnly={true} />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
              endpointId= {SystemRepository.Currency.qry}
              name='dispersalId'
              label='Dispersal'
              valueField='recordId'
              displayField='name'
              store={dispersalStore}
              required='true'
              />
            </Grid>
          </Grid>
          <Grid xs={12}>
            <Table
              columns={columns}
              gridData={gridData}
              rowId={['recordId']}
              isLoading={false}
              pagination={false}
              height={220}
              maxAccess={maxAccess}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default ProductFieldTab
