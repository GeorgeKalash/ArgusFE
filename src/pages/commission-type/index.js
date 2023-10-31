// ** React Importsport
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, Button, Checkbox, FormControlLabel } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { getNewCommissionType, populateCommissionType } from 'src/Models/CurrencyTradingSettings/CommissionType'
import { KVSRepository } from 'src/repositories/KVSRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Windows
import CommissionTypeWindow from './Windows/CommissionTypeWindow'

// ** Helpers
// import { getFormattedNumber, validateNumberField, getNumberWithoutCommas } from 'src/lib/numberField-helper'
import { defaultParams } from 'src/lib/defaults'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

const CommissionType = () => {
    const { getRequest, postRequest } = useContext(RequestsContext)
  
    //stores
    const [gridData, setGridData] = useState(null)
    const [typeStore, setTypeStore] = useState([])

    //states
  const [labels, setLabels] = useState(null)
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

    const _labels = {
        reference: labels && labels.find(item => item.key === 1).value,
        name: labels && labels.find(item => item.key === 2).value,
        type: labels && labels.find(item => item.key === 3).value,
        comissiontype: labels && labels.find(item => item.key === 4).value,
      }

      const columns = [
        {
          field: 'reference',
          headerName: _labels.reference,
          flex: 1
        },
        {
          field: 'name',
          headerName: _labels.name,
          flex: 1
        },
        ,
        {
          field: 'typeName',
          headerName: _labels.type,
          flex: 1
        }
      ]

      const commissiontypeValidation = useFormik({
        enableReinitialize: false,
        validateOnChange: false,
        validationSchema: yup.object({
          reference: yup.string().required('This field is required'),
          name: yup.string().required('This field is required'),
          type: yup.string().required('This field is required')
        }),
        onSubmit: values => {
          postCommissionType(values)
        }
      })
    
      const handleSubmit = () => {
        commissiontypeValidation.handleSubmit()
      }
      
      const getLabels = () => {
        var parameters = '_dataset=' + ResourceIds.CommissionType
    
        getRequest({
          extension: KVSRepository.getLabels,
          parameters: parameters
        })
          .then(res => {
            console.log('labels '+{ res })
            setLabels(res.list)
          })
          .catch(error => {
            setErrorMessage(error)
          })
      }
      
      const getGridData = () => {
        var parameters = '_filter='
        getRequest({
          extension: CurrencyTradingSettingsRepository.CommissionType.qry,
          parameters: parameters
        })
          .then(res => {
            setGridData(res)
          })
          .catch(error => {
            setErrorMessage(error)
          })
      }

      const fillTypeStore = () => {
        var parameters = '_database=3501' //add 'xml'.json and get _database values from there
        getRequest({
          extension: SystemRepository.KeyValueStore,
          parameters: parameters
        })
          .then(res => {
            setTypeStore(res.list)
          })
          .catch(error => {
            setErrorMsetTypeStoreessage(error)
          })
      }

      const postCommissionType = obj => {
        const recordId = obj.recordId
        postRequest({
          extension: CurrencyTradingSettingsRepository.CommissionType.set,
          record: JSON.stringify(obj)
        })
          .then(res => {
            getGridData({})
            setWindowOpen(false)
            if (!recordId) toast.success('Record Added Successfully')
            else toast.success('Record Editted Successfully')
          })
          .catch(error => {
            setErrorMessage(error)
          })
      }
    
      const delCommissionType = obj => {
        postRequest({
          extension: CurrencyTradingSettingsRepository.CommissionType.del,
          record: JSON.stringify(obj)
        })
          .then(res => {
            getGridData({})
            toast.success('Record Deleted Successfully')
          })
          .catch(error => {
            setErrorMessage(error)
          })
      }
    
      const addCommissionType = () => {
        commissiontypeValidation.setValues(getNewCommissionType())
        fillTypeStore()
        setEditMode(false)
        setWindowOpen(true)
      }
    
      const editCommissionType = obj => {
        commissiontypeValidation.setValues(populateCommissionType(obj))
        fillTypeStore()
        setEditMode(true)
        setWindowOpen(true)
      }
    
      useEffect(() => {
        getGridData()
        fillTypeStore()
        getLabels()
      }, [])

      return (
        <>
          <Box>
            <GridToolbar onAdd={addCommissionType} />
            <Table
              columns={columns}
              gridData={gridData}
              rowId={['recordId']}
              api={getGridData}
              onEdit={editCommissionType}
              onDelete={delCommissionType}
              isLoading={false}
              pageSize={50}
              paginationType='client'
            />
          </Box>
          {windowOpen && (
             <CommissionTypeWindow
             onClose={() => setWindowOpen(false)}
             width={600}
             height={400}
             onSave={handleSubmit}
             editMode={editMode}
             commissiontypeValidation={commissiontypeValidation}
             typeStore={typeStore}
             labels={_labels}
               />
                
             )}
             <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
           </>
         )
       }
       
       export default CommissionType
