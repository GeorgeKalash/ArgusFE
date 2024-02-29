import React from 'react';
import {createContext, useState, useContext,useEffect } from 'react'
import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'

import {Box } from '@mui/material'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { SystemFunction } from 'src/resources/SystemFunction'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'

import {
  formatDateToApi,
  formatDateToApiFunction,
  formatDateFromApi,formatDateDefault,formatDateFromApiInline
} from "src/lib/date-helper";

// ** Windows


// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'

const RecordDetailComponent =({labels, recordId ,functionId,formValues}) => {
    const { getRequest, postRequest } = useContext(RequestsContext)
    const [formik, setformik] = useState(null);
     const [tableData, setTableData] = useState([]);
    const [selectedRecordId, setSelectedRecordId] = useState(null)
  
    //states
    const [windowOpen, setWindowOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)
  
    async function fetchGridData(options = {}) {
      const { _startAt = 0, _pageSize = 50 } = options
  
      return await getRequest({
        extension: GeneralLedgerRepository.RecordDetailComponent.qry,
        parameters: `_functionId=${functionId}&_recordId=${recordId}`
      })
    }

    useEffect(() => {
      if (formValues) {
        setformik(formValues);
      }
    }, [formValues]);


  
    const {
      query: { data },
      labels: _labels,
      access
    } = useResourceQuery({
      queryFn: fetchGridData,
      endpointId: GeneralLedgerRepository.RecordDetailComponent.qry,
      datasetId: ResourceIds.RecordDetailComponent
    })


  
    const invalidate = useInvalidate({
      endpointId: GeneralLedgerRepository.RecordDetailComponent.qry
    })
  
    const columns = [
      {
        field:'accountRef',
        headerName : _labels.accountref,
        flex: 1
      },
      {
        field: 'accountName',
        headerName: _labels.accountName,
        flex: 1
      },
      {
        field: 'tpAccountRef',
        headerName: _labels.tpAccountRef,
        flex: 1,
        
      },{
        field:"tpAccountName",
        headerName:_labels.tpAccountName,
        flex:1
      },{
        field:"currencyRef",
        headerName:_labels.currencyRef,
        flex:1
      },{
        field:"sign",
        headerName:_labels.sign,
        flex:1,
        renderCell: (params) => {
          return params.value === 1 ? 'D' : 'C';
        }
      },{
        field:"notes",
        headerName:_labels.notes,
        flex:1
      },{
        field:"exRate",
        headerName:_labels.exRate,
        flex:1
      },{
        field:"amount",
        headerName:_labels.amount,
        flex:1
      },{
        field:"baseAmount",
        headerName:_labels.amount,
        flex:1
      }

    ]

    return (
      <>
        <Box>
          {formik && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  name="reference"
                  label="Reference"
                  value={formik.reference}
                  readOnly={true}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  name="date"
                  label={'date'}
                  value={formik.date}
                  readOnly={true}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  name="currencyRef"
                  label="Currency"
                  value={formik.currencyRef}
                  readOnly={true}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  name="notes"
                  label="Notes"
                  value={formik.notes}
                  readOnly={true}

                />
              </Grid>
            </Grid>
          )}
  
          <GridToolbar maxAccess={access} />
          <Table
            columns={columns}
            gridData={data}
            rowId={['seqNo']}
            isLoading={false}
            pageSize={50}
            paginationType='client'
            maxAccess={access}
          />
        </Box>
      </>
    );
  };

export default RecordDetailComponent;