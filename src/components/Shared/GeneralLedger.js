import React from 'react';
import {createContext, useState, useContext,useEffect } from 'react'
import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'

import {Box } from '@mui/material'
import { styled } from '@mui/material/styles';
import FormShell from "src/components/Shared/FormShell";



import { Module } from 'src/resources/Module'

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
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { DataGrid } from './DataGrid';
import { column } from 'stylis';
import { useFormik } from 'formik'
import { AuthContext } from 'src/providers/AuthContext'
import { getNewProductMaster } from 'src/Models/RemittanceSettings/ProductMaster';
import { formatDateDefault, formatDateFromApi, formatDateToApi, formatDateToApiFunction } from 'src/lib/date-helper'

const GeneralLedger =({ labels,recordId ,functionId,formValues,maxAccess}) => {
    const { getRequest, postRequest } = useContext(RequestsContext)
    const [formik, setformik] = useState(null);
    const { user, setUser } = useContext(AuthContext)
    const [baseGridData, setBaseGridData] = useState({ credit: 0, debit: 0, balance: 0 });
const [currencyGridData, setCurrencyGridData] = useState([]);
  
    //states
  
  
    async function fetchGridData(options = {}) {
      const { _startAt = 0, _pageSize = 50 } = options
  
      return await getRequest({
        extension: GeneralLedgerRepository.GeneralLedger.qry,
        parameters: `_functionId=${functionId}&_recordId=${recordId}`
      })
    }
    

    const [initialValues, setInitialData] = useState({
      recordId:formValues.recordId,
      reference:formValues.reference,
       date:formValues.date,
       functionId:functionId,
       seqNo:'',
      
    
      generalAccount: [{
          id: 1,
          account: {
            accountRef: ""
          },
          accountName: '',
          
          tpAccount: {
            reference: ""
          },
          
          tpAccountName: '',
          currency: {
            reference: ""
          },
          sign: {
            key: ""
          },
          notes: '',
          functionId:functionId,
          exRate: '',
          amount: '',
          baseAmount: '',
          
      }]
  
    })
  
    

 

    const formik2 = useFormik({
      initialValues,
      enableReinitialize: true,
      validateOnChange: true,
      

      
        onSubmit: async obj => {
          
          
          const data = {
            transactions: obj.generalAccount.map(
              ({ id, exRate, account, sign, tpAccount, functionId, ...rest }) => ({
                seqNo: id,
                
                accountId: account.recordId,
                exRate,
                sign: sign.key,
                tpAccountId: tpAccount.recordId,
                functionId,
                rateCalcMethod:1,
                currencyId:currency.recordId,
                ...rest
              })
            ),
            date: formatDateToApi(obj.date),
            functionId:obj.functionId,
            recordId:obj.recordId,
    
            reference:obj.reference
            
            
          }
          console.log(data)

         
          console.log(recordId)
      
          const response = await postRequest({
            extension: GeneralLedgerRepository.GeneralLedger.set2,
            record: JSON.stringify(data)
          });
          console.log(response.recordId)
      
          if (!recordId) {
            toast.success('Record Added Successfully');


          } else {
            toast.success('Record Edited Successfully');
    
          }
          
          setEditMode(true);
        ;
        }
      });

async function getData(id){

  const res = await getRequest({
    extension: GeneralLedgerRepository.GeneralLedger.get,
    parameters: `_recordId=${id}&_functionId=${functionId}`

  })
     formik.setValues({
        
      generalAccount: res.list.map(
          ({ seqNo, currencyId, currencyName, currencyRef,  ...rest }) => ({
            id : seqNo,
            currencyId: currencyId,
            currency :{
             recordId: currencyId, name :currencyName, reference :currencyRef
            },
   
           ...rest
          })
        )
      })
}

    
    useEffect(() => {
      if (formValues.recordId) {
        getData(formValues.recordId);
      }
    }, [formValues.recordId]);
    



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
     
      datasetId: ResourceIds.GeneralLedger
    })

    

  
 
    

    useEffect(() => {
      if (formik2 && formik2.values && formik2.values.generalAccount && Array.isArray(formik2.values.generalAccount)) {
        const generalAccountData = formik2.values.generalAccount;

        console.log(generalAccountData)

        const baseCredit = generalAccountData.reduce((acc, curr) => {
          return curr.sign?.key == '2' ? acc + parseFloat(curr.baseAmount || 0) : acc;
        }, 0);
    
        const baseDebit = generalAccountData.reduce((acc, curr) => {
          return curr.sign?.key == "1" ? acc + parseFloat(curr.baseAmount || 0) : acc;
        }, 0);
    
        const baseBalance = baseDebit - baseCredit;
    
        setBaseGridData({ base: 'Base', credit: baseCredit, debit: baseDebit, balance: baseBalance });
    
        const currencyTotals = generalAccountData.reduce((acc, curr) => {
          const currency = curr.currency?.reference;
          if (!acc[currency]) {
            acc[currency] = { credit: 0, debit: 0 };
          }
          if (curr.sign?.key == '2') {
            acc[currency].credit += parseFloat(curr.amount || 0);
          } else if (curr.sign?.key == '1') {
            acc[currency].debit += parseFloat(curr.amount || 0);
          }
          console.log(formik2)

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
    }, [formik2.values]);


    useEffect(() => {
      if (data && data.list.length>0 && Array.isArray(data.list)) {

          console.log(data);

        const generalAccount=  data.list.map((row, idx) => ({
          id: idx,
          account: {accountRef: row.accountRef,
            recordId:row.accountId},
          accountName: row.accountName,
          tpAccount: {reference: row.tpAccountRef},
          tpAccountName: row.tpAccountName,
          currency:{
            reference: row.currencyRef,
            recordId : row.currencyId
          },
          
          sign: {
            "dataset": 157,
            "language": 1,
            "key": row.sign,
            "value": row.sign == 1 ? "D" : "C"

          },
          notes: row.notes,
          exRate: row.exRate,
          amount: row.amount,
          baseAmount: row.baseAmount
      }));

      formik2.setFieldValue("generalAccount", generalAccount);
      }
    }, [data]);

    const RateDivision = {
      FINANCIALS: 1,
      SALES: 2,
      PURCHASE: 3,
      MANUFACTURING: 4
    };

    // Function to get rate division
    // console.log('idddddddddd',functionId)

    const getRateDivision = (functionId) => {
      const sysFct = getSystemFunctionModule(functionId);
      if (
        sysFct ===Module.GeneralLedger||
        sysFct === Module.Financials ||
        sysFct === Module.Manufacturing||
        sysFct === Module.Cash
      ) {
        return RateDivision.FINANCIALS;
      } else if (sysFct ===Module.Sales) {
        return RateDivision.SALES;
      } else if (sysFct === Module.Purchase) {
        return RateDivision.PURCHASE;
      } else if (sysFct === Module.Manufacturing) {
        return RateDivision.MANUFACTURING;
      } else {
        return 0;
      }
    };

    // Function to get system function module

    const getSystemFunctionModule = (functionId) => {
      return Math.floor(functionId / 100);
    };

    function getCurrencyApi(_currencyId){
      

      const _rateDivision = getRateDivision(functionId)
    
      console.log("ratde",_rateDivision)

     

      return getRequest({

        

        extension: MultiCurrencyRepository.Currency.get,
        parameters: `_currencyId=${_currencyId}&_date=${formatDateToApiFunction(formValues.date)}&_rateDivision=${_rateDivision}`
      })
      
    }
  



    return (
      <FormShell
      resourceId={ResourceIds.GeneralLedger}
      form={formik2}
      maxAccess={maxAccess}
    >
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
                  name="currency"
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
  height={300}
  columns={[
    {

      component: 'resourcelookup',
      
      label: _labels.accountRef,
      name: 'account',
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
      name: 'tpAccount',
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
      name: 'currency',
      props: {
        endpointId: SystemRepository.Currency.qry,
        displayField: 'reference',
        valueField: 'recordId',
      },

      async onChange({ row: { update, oldRow, newRow } }) {
       
        if(!newRow?.currency?.recordId){
        return;
        }
       

        const result = await getCurrencyApi(newRow?.currency?.recordId)

        const result2 = result.record
        const exRate = result2.exRate
        const rateCalcMethod = result2.rateCalcMethod

        const amount =
          rateCalcMethod === 1
            ? parseFloat(newRow.amount.toString().replace(/,/g, '')) * exRate
            : rateCalcMethod === 2
            ? parseFloat(newRow.amount.toString().replace(/,/g, '')) / exRate
            : 0

        

        update({
          baseAmount:amount,
          currencyId: newRow.currency.recordId,
          exRate:exRate,
          rateCalcMethod :rateCalcMethod,

     
        })
        
        // if (!exchange?.rate){
        //   stackError({
        //     message: `Rate not defined for ${newRow.currency.name}.`
        //   })

        // return;

        // }
        // if (exchange && newRow.fcAmount ) {
        //   const exRate = exchange.rate
        //   const rateCalcMethod = exchange.rateCalcMethod

        //   const lcAmount =
        //     rateCalcMethod === 1
        //       ? parseFloat(newRow.fcAmount.toString().replace(/,/g, '')) * exRate
        //       : rateCalcMethod === 2
        //       ? parseFloat(newRow.fcAmount.toString().replace(/,/g, '')) / exRate
        //       : 0

        //       exchange.rate &&  update({lcAmount :  lcAmount})

        //  }

       

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
              { field: 'currency', headerName: 'Currency' },
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
      </FormShell>
    );
  };

export default GeneralLedger;



