import React from 'react';
import {createContext, useState, useContext,useEffect } from 'react'
import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'

import {Box } from '@mui/material'
import { styled } from '@mui/material/styles';





// ** Custom Imports
import Table from 'src/components/Shared/Table'
import newTable from 'src/components/Shared/newTable'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { SystemFunction } from 'src/resources/SystemFunction'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomTable from 'src/components/Shared/CustomTable'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'


// ** Windows


// ** Helpers
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'

const GeneralLedger =({ labels,recordId ,functionId,formValues}) => {
    const { getRequest, postRequest } = useContext(RequestsContext)
    const [formik, setformik] = useState(null);

    const [baseGridData, setBaseGridData] = useState({ credit: 0, debit: 0, balance: 0 });
const [currencyGridData, setCurrencyGridData] = useState([]);
  
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
        flex:1,
      },{
        field:"exRate",
        headerName:_labels.exRate,
        flex:1,
        align: 'right',
      },{
        field:"amount",
        headerName:_labels.amount,
        flex:1,
        align: 'right',
        
      },{
        field:"baseAmount",
        headerName:_labels.base,
        flex:1,
        align: 'right',
        headerAlign: 'right',
      }

    ]

    useEffect(() => {
      if (data && data.list && Array.isArray(data.list)) {
        const baseCredit = data.list.reduce((acc, curr) => curr.sign === 2 ? acc + parseFloat(curr.baseAmount || 0) : acc, 0);
        const baseDebit = data.list.reduce((acc, curr) => curr.sign === 1 ? acc + parseFloat(curr.baseAmount || 0) : acc, 0);
        const baseBalance = baseDebit - baseCredit;
        
        setBaseGridData({ base :'Base',credit: baseCredit, debit: baseDebit, balance: baseBalance });
    
        const currencyTotals = data.list.reduce((acc, curr) => {
          const currency = curr.currencyRef;
          if (!acc[currency]) {
            acc[currency] = { credit: 0, debit: 0 };
          }
          if (curr.sign === 2) {
            acc[currency].credit += parseFloat(curr.amount || 0);
          } else if (curr.sign === 1) {
            acc[currency].debit += parseFloat(curr.amount || 0);
          }

          return acc;
        }, {});
    
        const currencyData = Object.entries(currencyTotals).map(([currency, { credit, debit }]) => ({
          currency,
          credit,
          debit,
          balance: debit - credit
        }));
        
        setCurrencyGridData(currencyData);
      }
    }, [data]);



    return (
      <>
        <Box>
          {formik && (
            <Grid container spacing={2} padding={1}>
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
          <Table
            columns={columns}
            gridData={data}
            rowId={['seqNo']}
            isLoading={false}
            pageSize={50}
            paginationType='client'
            maxAccess={access}
            height={"280"}
            pagination={false}
          />
          <Grid container paddingTop={2}>
            <Grid xs={6}>
              <Box paddingInlineEnd={2}  sx={{
              width: '25.5rem',
              overflow:'hidden',
              marginLeft:'3rem'
            }}>
                <Table
                  gridData={{count: 1, list: [baseGridData]}}
                  maxAccess={access}
                  height={"150"}
                  columns={[
                    { field: 'base', headerName:_labels.base },
                    { field: 'credit', headerName:_labels.credit },
                    { field: 'debit', headerName: _labels.debit },
                    { field: 'balance', headerName:_labels.balance }
                  ]}
                  rowId={['seqNo']}
                  pagination={false}
                />
              </Box>
            </Grid>
             <Grid xs={6}>
              <Box   paddingInlineStart={2}
            sx={{
              width: '26rem', 
              overflow: 'hidden', 
              position: 'relative',
              marginLeft:'2rem'
              
            }}>
                <Table
            pagination={false}
            gridData={{count: currencyGridData.length, list: currencyGridData}}
            columns={[
              { field: 'currency', headerName: 'Currency' },
              { field: 'debit', headerName: 'Debit' },
              { field: 'credit', headerName: 'Credit' },
              { field: 'balance', headerName: 'Balance' }
            ]}
            height={"150"}
            rowId={['currency']}
            maxAccess={access}
                /> 
              </Box>
            </Grid>
          </Grid>
          <GridToolbar maxAccess={access}  />
        </Box>
      </>
    );
  };

export default GeneralLedger;