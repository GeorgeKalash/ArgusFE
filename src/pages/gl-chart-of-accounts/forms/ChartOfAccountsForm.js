// ** MUI Imports
import { Grid , FormControlLabel, Checkbox } from '@mui/material'
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
        validationSchema: yup.object({

        }),
        onSubmit: async obj => {
          const recordId = obj.recordId

          const response = await postRequest({
            extension: GeneralLedgerRepository.ChartOfAccounts.set,
            record: JSON.stringify(obj)
          })
          
          if (!recordId) {
            toast.success('Record Added Successfully')
            setInitialData({
              ...obj, // Spread the existing properties
              recordId: response.recordId, // Update only the recordId field
            });
          }
          else toast.success('Record Edited Successfully')
          setEditMode(true)

          invalidate()
        }
      })
    
      useEffect(() => {
        ;(async function () {
          try {
            if (recordId) {
              setIsLoading(true)
    
              const res = await getRequest({
                extension: GeneralLedgerRepository.ChartOfAccounts.get,
                parameters: `_recordId=${recordId}`
              })
              
              setInitialData(res.record)
            }
          } catch (exception) {
            setErrorMessage(error)
          }
          setIsLoading(false)
        })()
      }, [])
      
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
                    <CustomTextField
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
                    />
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