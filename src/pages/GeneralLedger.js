import React from 'react';
import {createContext, useState, useContext,useEffect } from 'react'
import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'

import {Box } from '@mui/material'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import newTable from 'src/components/Shared/newTable'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { SystemFunction } from 'src/resources/SystemFunction'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'

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

const GeneralLedger =({ labels,recordId ,functionId,formValues}) => {
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
        extension: GeneralLedgerRepository.GeneralLedger.qry,
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
      endpointId: GeneralLedgerRepository.GeneralLedger.qry,
      datasetId: ResourceIds.GeneralLedger
    })


  
    const invalidate = useInvalidate({
      endpointId: GeneralLedgerRepository.GeneralLedger.qry
    })
  
    const columns = [
      {
        field:'accountRef',
        headerName : _labels.accountRef,
        flex: 1
      },
      {
        field: 'accountName',
        headerName: _labels.accountName,
        flex: 1
      },
      {
        field: 'tpAccountRef',
        headerName: _labels.thirdPartyRef,
        flex: 1,
        
      },{
        field:"tpAccountName",
        headerName:_labels.thirdPartyName,
        flex:1
      },{
        field:"currencyRef",
        headerName:_labels.currency,
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
        headerName:_labels.base,
        flex:1
      }

    ]
    useEffect(() => {
      if (data && data.list && Array.isArray(data.list)) {
        // Base Grid Calculations
        const baseCredit = data.list.reduce((acc, curr) => curr.sign === 2 ? acc + parseFloat(curr.amount || 0) : acc, 0);
        const baseDebit = data.list.reduce((acc, curr) => curr.sign === 1 ? acc + parseFloat(curr.amount || 0) : acc, 0);
        const baseBalance = baseDebit - baseCredit;
        console.log(`Base Grid - Credit: ${baseCredit}, Debit: ${baseDebit}, Balance: ${baseBalance}`);
        
        // Currency Grid Calculations
        const currencyTotals = data.list.reduce((acc, curr) => {
          if (!acc[curr.currencyRef]) {
            acc[curr.currencyRef] = { credit: 0, debit: 0 };
          }
          if (curr.sign === 2) {
            acc[curr.currencyRef].credit += parseFloat(curr.amount || 0);
          } else if (curr.sign === 1) {
            acc[curr.currencyRef].debit += parseFloat(curr.amount || 0);
          }
          
          return acc;
        }, {});
        
        Object.entries(currencyTotals).forEach(([currency, { credit, debit }]) => {
          const balance = debit - credit;
          console.log(`Currency Grid - Currency: ${currency}, Credit: ${credit}, Debit: ${debit}, Balance: ${balance}`);
        });
      }
    }, [data]);

    return (
      <>
        <Box>
          {formik && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  name="reference"
                  label={_labels.reference}
                  value={formik.reference}
                  readOnly={true}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomDatePicker
                  name="date"
                  label={_labels.date}
                  value={formik.date}
                  readOnly={true}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  name="currencyRef"
                  label={_labels.currency}
                  value={formik.currencyRef}
                  readOnly={true}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  name="notes"
                  label={_labels.notes}
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

export default GeneralLedger;