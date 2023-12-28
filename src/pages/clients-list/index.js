import React, { useContext, useEffect } from 'react'
import { Box, Grid } from '@mui/material'
import Table from 'src/components/Shared/Table'
import { useState } from 'react'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'

import CustomTextField from 'src/components/Inputs/CustomTextField'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { formatDateFromApi } from 'src/lib/date-helper'


const ClientsList = () => {


  const { getLabels, getAccess } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])

  //states

  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    if (!access) getAccess(ResourceIds.ClientList, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        // getGridData({ _startAt: 0, _pageSize: 30 })

        getLabels(ResourceIds.ClientList, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  const _labels = {
    category: labels && labels.find(item => item.key === 1).value,
    reference: labels && labels.find((item) => item.key === 2).value,
    name: labels && labels.find((item) => item.key === 3).value,
    flName : labels && labels.find((item) => item.key === 4).value,
    cellPhone: labels && labels.find((item) => item.key === 5).value,
    plant: labels && labels.find(item => item.key === 6).value,
    nationality: labels && labels.find((item) => item.key === 7).value,
    keyword: labels && labels.find((item) => item.key === 8).value,
    status: labels && labels.find((item) => item.key === 9).value,
    createdDate: labels && labels.find((item) => item.key === 10).value,
    expiryDate: labels && labels.find(item => item.key === 11).value,
    otp: labels && labels.find((item) => item.key === 12).value,

  }



  const columns = [
    {
      field: 'categoryName',
      headerName: _labels?.category,
      flex: 1,
      editable: false
    },
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1,
      editable: false
    },
    {
      field: 'name',

      headerName: _labels.name,
      flex: 1,
      editable: false
    },

    {
      field: 'flName',

      headerName: _labels.flName,
      flex: 1,
      editable: false
    },
    {
      field: 'cellPhone',
      headerName: _labels.cellPhone,
      flex: 1,
      editable: false
    },
    {
      field: 'plantName',

      headerName: _labels.plant,
      flex: 1,
      editable: false
    },
    {
      field: 'nationalityName',

      headerName: _labels.nationality,
      flex: 1,
      editable: false
    },

    {
      field: 'keyword',

      headerName: _labels.keyword,
      flex: 1,
      editable: false
    },

    {
      field: 'statusName',

      headerName: _labels.status,
      flex: 1,
      editable: false,


    },
    {
      field: 'createdDate',

      headerName: _labels.createdDate,
      flex: 1,
      editable: false,
      valueGetter: ({ row }) => formatDateFromApi(row?.createdDate)

    },
    {
      field: 'expiryDate',

      headerName: _labels.expiryDate,
      flex: 1,
      editable: false,
      valueGetter: ({ row }) => formatDateFromApi(row?.expiryDate)


    },
    {
      field: 'otp',

      headerName: _labels.otp,
      flex: 1,
      editable: false,

    }
  ]

  const search = e => {
    setGridData({count : 0, list: [] , message :"",  statusId:1})
     const input = e.target.value
     console.log({list: []})

  console.log(gridData)
     if(input.length > 6){
    var parameters = `_size=30&_startAt=0&_filter=${input}`
    getRequest({
      extension: CTCLRepository.CtClientIndividual.snapshot,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })

    }else{

      setGridData({count : 0, list: [] , message :"",  statusId:1})
    }

  }








  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >

<Grid container spacing={2}>
<Grid item xs={6}>
            <CustomTextField
              name='search'

              // label={labels.reference}
              // value={ProfessionValidation.values.reference}
              required

              onChange={search}

              // maxLength = '10'

              // maxAccess={maxAccess}

              // onClear={() => ProfessionValidation.setFieldValue('search', '')}
              // error={ProfessionValidation.touched.reference && Boolean(ProfessionValidation.errors.reference)}
              // helperText={ProfessionValidation.touched.reference && ProfessionValidation.errors.reference}
            />
          </Grid>
</Grid>

{gridData &&
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          isLoading={false}
          maxAccess={access}

        />}


<ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />

      </Box>


    </>
  )
}

export default ClientsList
