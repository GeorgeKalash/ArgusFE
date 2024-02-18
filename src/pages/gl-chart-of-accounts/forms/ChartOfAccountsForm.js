// ** MUI Imports
import { Grid , FormControlLabel, Checkbox, Box, TextField } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from "src/resources/DataSets";

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'

import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'


import { SystemRepository } from 'src/repositories/SystemRepository'

export default function ChartOfAccountsForm({ labels, maxAccess, recordId }) {
    const [isLoading, setIsLoading] = useState(false)
    const [editMode, setEditMode] = useState(!!recordId)
    
    const [initialValues, setInitialData] = useState({
        recordId: null,
        accountRef: '',
        name: '',
        description :'',
        groupId:'',
        isCostElement:false,
        sign:'',
        groupName:'',
        activeStatus:'',
        activeStatusName:""

      })

    const { getRequest, postRequest } = useContext(RequestsContext)

    //const editMode = !!recordId

    const invalidate = useInvalidate({
        endpointId: GeneralLedgerRepository.ChartOfAccounts.page
      })
  
    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validateOnChange: true,
  
        onSubmit: async obj => {
          // Ensure `isCostElement` is a boolean. Convert if it's an array or any other format.
          const isCostElementBoolean = Array.isArray(obj.isCostElement) ? obj.isCostElement.includes("on") : !!obj.isCostElement;
          
          // Prepare the object for submission with `isCostElement` as a boolean.
          const submissionObject = {
            ...obj,
            isCostElement: isCostElementBoolean,
          };          

          const response = await postRequest({
            extension: GeneralLedgerRepository.ChartOfAccounts.set,
            record: JSON.stringify(submissionObject) // Use the modified object here
          });

          
          if (!obj.recordId) {
            toast.success('Record Added Successfully');
            setInitialData({
              ...submissionObject, // Use the modified object to update the state
              recordId: response.recordId, // Update the record ID from the response
            });
          } else {
            toast.success('Record Edited Successfully');
          }
          setEditMode(true);
        
          invalidate();
        }
        
      })
    
      useEffect(() => {
        ;(async function () {
          try {
            if (recordId) {
              setIsLoading(true)
    
              getDataResult();
              
              const res = await getRequest({
                extension: GeneralLedgerRepository.ChartOfAccounts.get,
                parameters: `_recordId=${recordId}`
              })
              console.log(res.record)

              setInitialData(res.record)
            }
          } catch (exception) {
            setErrorMessage(error)
          }
          setIsLoading(false)
        })()
      }, []);


      const [segments, setSegments] = useState([]);
      
      const getDataResult = () => {
        console.log("SOmething")
        const myObject = {};
        var parameters = `_filter=`
        getRequest({
          extension:  SystemRepository.Defaults.qry,
          parameters: parameters
        })
        .then(res => {
          
            const filteredList = res.list.filter(obj => {
                return (
                    obj.key === 'GLACSeg0' || 
                    obj.key === 'GLACSeg1' || 
                    obj.key === 'GLACSeg2' || 
                    obj.key === 'GLACSeg3' ||
                    obj.key === 'GLACSeg4'
                )
            }).map(obj => {
              obj.value = parseInt(obj.value)
              
              return obj;
            });

            // filteredList.forEach(obj => {
            //     myObject[obj.key] = (
            //         obj.key === 'GLACSeg0' || 
            //         obj.key === 'GLACSeg1' || 
            //         obj.key === 'GLACSeg2' || 
            //         obj.key === 'GLACSeg3' ||
            //         obj.key === 'GLACSeg4' 

            //     ) ? (obj.value ? parseInt(obj.value) : null) :  (obj.value ? obj.value : null) ;
              
            // });
            
            setSegments(filteredList);
        })
        .catch(error => {
            setErrorMessage(error);
        });
      };

      
    return (
        <FormShell 
            resourceId={ResourceIds.ChartOfAccounts}
            form={formik} 
            height={300} 
            maxAccess={maxAccess} 
            editMode={editMode}
        >
            <Grid container spacing={4}>
            <Grid item xs={12}>
            <ResourceComboBox
              endpointId={GeneralLedgerRepository.GLAccountGroups.qry}
              name='groupId'
              label={labels.group}
              columnsInDropDown={[

               
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              valueField='recordId'
              displayField= {['name']}
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik && formik.setFieldValue('groupId', newValue?.recordId)
              }}

              // error={formik.touched.nationalityId && Boolean(formik.errors.nationalityId)}
              // helperText={formik.touched.nationalityId && formik.errors.nationalityId}
            />
          </Grid>
                <Grid item xs={12}>
                    <SegmentedInput segments={segments} setInput={(input) => formik && formik.setFieldValue('accountRef', input)} />
                    {/* <CustomTextField
                    name='accountRef'
                    label={labels.accountRef}
                    value={formik.values.accountRef}
                    required
                    maxAccess={maxAccess}
                    maxLength='30'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('accountRef', '')}
                    error={formik.touched.accountRef && Boolean(formik.errors.accountRef)}
                    helperText={formik.touched.accountRef && formik.errors.accountRef}
                    /> */}
                </Grid>
                <Grid item xs={12}>
                    <CustomTextField
                    name='name'
                    label={labels.name}
                    value={formik.values.name}
                    required
                    rows={2}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('name', '')}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    />
                </Grid>
                <Grid item xs={12}>
                    <CustomTextField
                    name='description'
                    label={labels.description}
                    value={formik.values.description}
                    required
                    rows={2}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('description', '')}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                    />
                </Grid>
                <Grid item xs={12}>
                    <ResourceComboBox
                      name="activeStatus"
                      label={labels.status}
                      datasetId={DataSets.ACTIVE_STATUS}
                      values={formik.values}
                      valueField="key"
                      displayField="value"

                      onChange={(event, newValue) => {
                        if (newValue) {
                          formik.setFieldValue(
                            "activeStatus",
                            newValue?.key,
                            
                          );
                        } else {
                          formik.setFieldValue(
                            "activeStatus",
                            newValue?.key
                          );
                        }
                      }}

                      error={
                        formik.touched. activeStatus &&
                        Boolean(formik.errors. activeStatus)
                      }
                      helperText={
                        formik.touched. activeStatus &&
                        formik.errors. activeStatus
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ResourceComboBox
                      name="sign"
                      label={labels.creditDebit}
                      datasetId={DataSets.Sign}
                      values={formik.values}
                      valueField="key"
                      displayField="value"

                      onChange={(event, newValue) => {
                        if (newValue) {
                          formik.setFieldValue(
                            "sign",
                            newValue?.key,
                            
                          );
                        } else {
                          formik.setFieldValue(
                            "sign",
                            newValue?.key
                          );
                        }
                      }}

                      error={
                        formik.touched. sign &&
                        Boolean(formik.errors. sign)
                      }
                      helperText={
                        formik.touched. activeStatus &&
                        formik.errors. activeStatus
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name='isCostElement'
                  maxAccess={maxAccess}
                  checked={formik.values?.isCostElement}
                  onChange={formik.handleChange}
                />
              }
              label={labels.isCostElement}
            />
          </Grid>
            </Grid>
        </FormShell>
  )
}


import {  createRef } from 'react';

const SegmentedInput = ({ segments, setInput }) => {
  // Create state to hold values of each segment
  const [values, setValues] = useState([]);
  
  // Create refs for each input to manage focus
  const inputRefs = Array(segments.length).fill().map(() => createRef());
  
  const handleChange = (index, event) => {
    const maxLength = segments[index].value;
    const newValues = [...values];
    newValues[index] = event.target.value.slice(0, maxLength);
    setValues(newValues);
  
    // Move focus to next input if we've reached the max length and it's not the last input
    if (event.target.value.length >= maxLength && index < segments.length - 1) {
      inputRefs[index + 1].current.focus();
    }
      let finalInput = '';
      inputRefs.forEach((input, index) => {
        finalInput += input.current.value

        if(index != inputRefs.length - 1 && input.current.value.length == segments[index].value)
          finalInput += "-"

      });
      console.log(finalInput)
    setInput(finalInput)

  };

  useEffect(() => {
    setValues(Array(segments.length).fill(""))
  }, [segments])

  
  return (
    <div>
      {values.map((value, index) => (
        <>
        <input
          key={index}
          ref={inputRefs[index]}
          value={value}
          onChange={(e) => handleChange(index, e)}
          maxLength={segments[index].value}
          style={{ marginRight: '8px', width: segments[index].value + 1 + "ch" }} // Add some spacing between inputs
        />
        {index != values.length - 1 && "-"}
        </>
        ))}
    </div>
  );
};