import React from 'react';
import {createContext, useState, useContext,useEffect } from 'react'
import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'

import {Box } from '@mui/material'
import { styled } from '@mui/material/styles';





// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { SystemFunction } from 'src/resources/SystemFunction'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'


// ** API
import { RequestsContext } from 'src/providers/RequestsContext'


// ** Windows


// ** Helpers
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DataGrid } from './DataGrid';
import { column } from 'stylis';
import { useFormik } from 'formik'
import { AuthContext } from 'src/providers/AuthContext'
import { getNewProductMaster } from 'src/Models/RemittanceSettings/ProductMaster';

const GeneralLedger =({ labels,recordId ,functionId,formValues}) => {
    const { getRequest, postRequest } = useContext(RequestsContext)
    const [formik, setformik] = useState(null);
    const { user, setUser } = useContext(AuthContext)
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

    const [initialValues, setInitialData] = useState({
      reference: '',
      date: '',
      currencyRef: '',
      notes: '',
      generalAccount: [{
          id: 1,
          accountRef: '',
          accountName: '',
          tpAccountRef: '',
          tpAccountName: '',
          currencyRef: '',
          sign: '',
          notes: '',
          exRate: '',
          amount: '',
          baseAmount: ''
      }]
  

  
    })
  


    const formik2 = useFormik({
      initialValues,
      enableReinitialize: true,
      validateOnChange: true,

      onSubmit: async obj => {

      }
    })
    

    
    // useEffect(() => {
    //   if (formValues) {
    //     setformik(formValues);
    //   }
    // }, [formValues]);

    

  
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

    // const columns = [
    //   {
    //     field:'accountRef',
    //     headerName : _labels.accountRef,
    //     flex: 1
    //   },
    //   {
    //     field: 'accountName',
    //     headerName: _labels.accountName,
    //     flex: 1
    //   },
    //   {
    //     field: 'tpAccountRef',
    //     headerName: _labels.thirdPartyRef,
    //     flex: 1,
        
    //   },{
    //     field:"tpAccountName",
    //     headerName:_labels.thirdPartyName,
    //     flex:1
    //   },{
    //     field:"currencyRef",
    //     headerName:_labels.currency,
    //     flex:1
    //   },{
    //     field:"sign",
    //     headerName:_labels.sign,
    //     flex:1,
    //     renderCell: (params) => {
    //       return params.value === 1 ? 'D' : 'C';
    //     }
    //   },{
    //     field:"notes",
    //     headerName:_labels.notes,
    //     flex:1,
    //   },{
    //     field:"exRate",
    //     headerName:_labels.exRate,
    //     flex:1,
    //     align: 'right',
    //   },{
    //     field:"amount",
    //     headerName:_labels.amount,
    //     flex:1,
    //     align: 'right',
        
    //   },{
    //     field:"baseAmount",
    //     headerName:_labels.base,
    //     flex:1,
    //     align: 'right',
  
    //   }

    // ]

    useEffect(() => {
      if (formik2 && formik2.values && formik2.values.generalAccount && Array.isArray(formik2.values.generalAccount)) {
        const generalAccountData = formik2.values.generalAccount;
        console.log(generalAccountData)

        const baseCredit = generalAccountData.reduce((acc, curr) => {
          return curr.sign?.key === '2' ? acc + parseFloat(curr.baseAmount || 0) : acc;
        }, 0);
    
        const baseDebit = generalAccountData.reduce((acc, curr) => {
          return curr.sign?.key === "1" ? acc + parseFloat(curr.baseAmount || 0) : acc;
        }, 0);
    
        const baseBalance = baseDebit - baseCredit;
    
        setBaseGridData({ base: 'Base', credit: baseCredit, debit: baseDebit, balance: baseBalance });
    
        const currencyTotals = generalAccountData.reduce((acc, curr) => {
          const currency = curr.currencyRef.reference;
          if (!acc[currency]) {
            acc[currency] = { credit: 0, debit: 0 };
          }
          if (curr.sign?.key === '2') {
            acc[currency].credit += parseFloat(curr.amount || 0);
          } else if (curr.sign?.key === '1') {
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

        console.log(baseGridData, currencyGridData, currencyTotals)
      }
    }, [formik2.values]);


    useEffect(() => {
      if (data && data.list && Array.isArray(data.list)) {
        const baseCredit = data.list.reduce((acc, curr) => curr.sign !== 1 ? acc + parseFloat(curr.baseAmount || 0) : acc, 0);
        const baseDebit = data.list.reduce((acc, curr) => curr.sign === 1 ? acc + parseFloat(curr.baseAmount || 0) : acc, 0);
        const baseBalance = baseDebit - baseCredit;
        
        setBaseGridData({ base: 'Base', credit: baseCredit, debit: baseDebit, balance: baseBalance });
      }
    }, []);

    useEffect(() => {
      if (data && data.list && Array.isArray(data.list)) {
        const currencyTotals = data.list.reduce((acc, curr) => {
          const currency = curr.currencyRef;
          if (!acc[currency]) {
            acc[currency] = { credit: 0, debit: 0 };
          }
          if (curr.sign === 2) { // Assuming sign 2 represents credit
            acc[currency].credit += parseFloat(curr.amount || 0);
          } else if (curr.sign === 1) { // Assuming sign 1 represents debit
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
          {formik2 && (
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
          {/* <Table
            columns={columns}
            gridData={data}
            rowId={['seqNo']}
            isLoading={false}
            pageSize={50}
            paginationType='client'
            maxAccess={access}
            height={"280"}
            pagination={false}
          /> */}
      <DataGrid
  onChange={value => formik2.setFieldValue('generalAccount', value)}
  value={formik2.values.generalAccount}
  error={formik2.errors.generalAccount}
  columns={[
    {
      component: 'resourcelookup',
      label: _labels.accountRef,
      name: 'accountRef',
      props: {
        endpointId: GeneralLedgerRepository.Account.snapshot,
        parameters: '_type=',
        displayField: 'accountRef',
        valueField: 'recordId',
        fieldsToUpdate: [{ from: 'name', to: 'accountName' }],
      },
    },
    {
      component: 'textfield',
      label: _labels.accountName,
      name: 'accountName',
    },
    {
      component: 'resourcelookup',
      label: _labels.thirdPartyRef,
      name: 'tpAccountRef',
      props: {
        endpointId: FinancialRepository.Account.snapshot,
        displayField: 'reference',
        valueField: 'recordId',
        fieldsToUpdate: [{ from: 'name', to: 'tpAccountName' }],
      },
    },
    {
      component: 'textfield',
      label: _labels.thirdPartyName,
      name: 'tpAccountName',
    },
    {
      component: 'resourcecombobox',
      label: _labels.currency,
      name: 'currencyRef',
      props: {
        endpointId: SystemRepository.Currency.qry,
        displayField: 'reference',
        valueField: 'recordId',
      },
    },
    {
      component: 'resourcecombobox',
      label: _labels.sign,
      name: 'sign',
      props: {
        endpointId: SystemRepository.KeyValueStore,
        _language: user.languageId,
        parameters: `_dataset=${157}&_language=${1}`,
        displayField: 'value',
        valueField: 'recordId',
      },
    },
    {
      component: 'textfield',
      label: _labels.notes,
      name: 'notes',
    },
    {
      component: 'numberfield',
      label: _labels.exRate,
      name: 'exRate',
    },
    {
      component: 'numberfield',
      label: _labels.amount,
      name: 'amount',
    },
    {
      component: 'numberfield',
      label: _labels.baseAmount,
      name: 'baseAmount',
    },
  ]}
/>
       





       
          <Grid container paddingTop={2}>
            <Grid xs={6}>
              <Box paddingInlineEnd={2}  sx={{
              width: '25.8rem',
              overflow:'hidden',
              marginLeft:'3rem'
            }}>
               
                <Table
                  gridData={{count: 1, list: [baseGridData]}}
                  maxAccess={access}
             
                  height={"150"}
                  columns={[
                    { field: 'base', headerName:_labels.base },
                    { field: 'credit', headerName:_labels.credit,align: 'right', },
                    { field: 'debit', headerName: _labels.debit,align: 'right', },
                    { field: 'balance', headerName:_labels.balance,align: 'right', }
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
              marginLeft:'1rem'
              
            }}>
                <Table
            pagination={false}
            gridData={{count: currencyGridData.length, list: currencyGridData}}
            columns={[
              { field: 'currency.name', headerName: 'Currency' },
              { field: 'debit', headerName: 'Debit',align: 'right', },
              { field: 'credit', headerName: 'Credit',align: 'right', },
              { field: 'balance', headerName: 'Balance',align: 'right', }
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



