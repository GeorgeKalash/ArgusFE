import { Box } from '@mui/material'
import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'

// ** Custom Imports
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'

const IdFieldsForm = ({
  store,
  setStore,
  labels,
  editMode,
  height,
  expanded,
  maxAccess
}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const {recordId : idtId } = store

  const formik = useFormik({
      enableReinitialize: false,
      validateOnChange: true,
      validationSchema: yup.object({ IdField: yup
        .array()
        .of(
          yup.object().shape({
            accessLevel: yup.string().required('Access Level recordId is required')
          })
        ).required('Operations array is required') }),
      initialValues: {
        IdField: [
          { id :1,
            idtId: idtId,
            accessLevel: null,
            accessLevel: null,
            accessLevelName: '',
            controlId: ''
          }
        ]
      },
      onSubmit: values => {
        postIdFields(values.IdField)
      }
    })

    const postIdFields = obj => {

      const data = {
        idtId: idtId,
        items : obj.map(
          ({ accessLevel, controlId} ) => ({
              idtId: idtId,
              accessLevel: Number(accessLevel),
              controlId: controlId
          })
        )
      }
      postRequest({
        extension: CurrencyTradingSettingsRepository.IdFields.set2,
        record: JSON.stringify(data)
      })
        .then(res => {
          if (res) toast.success('Record Edited Successfully')
          getIdField(idtId)
        })
        .catch(error => {
        })
    }

    const column = [
      {
        component: 'textfield',
        label: labels.control,
        name: 'controlId',
        mandatory: true
      },
      {
        component: 'resourcecombobox',
        label: labels.accessLevel,
        name: 'accessLevel',
        props: {
          datasetId: DataSets.AU_RESOURCE_CONTROL_ACCESS_LEVEL,
          valueField: 'key',
          displayField: 'value',
          mapping: [ 
            { from: 'value', to: 'accessLevelName' },
            { from: 'key', to: 'accessLevel' } 
          ]
        }
      }    
    ]
    useEffect(()=>{
      idtId  && getIdField(idtId)
    }, [idtId])

    const getIdField = idtId => {
      const defaultParams = `_idtId=${idtId}`
      var parameters = defaultParams
      getRequest({
        extension: CurrencyTradingSettingsRepository.IdFields.qry,
        parameters: parameters
      })
        .then(res => {
          if (res.list.length > 0){
             const IdField = res.list.map(({ accessLevel, ...rest } , index) => ({
               id : index,
               accessLevel: accessLevel.toString(),
               ...rest
            }))
            formik.setValues({ IdField: IdField})

          setStore(prevStore => ({
            ...prevStore,
            IdField: IdField,
          }));
          }
        })
        .catch(error => {
        })
    }

  return (
    <FormShell 
      form={formik}
      resourceId={ResourceIds.IdTypes}
      maxAccess={maxAccess}
      infoVisible={false}
      editMode={editMode}
    >
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', scroll: 'none', overflow:'hidden' }}>
        <DataGrid
          onChange={value => formik.setFieldValue('IdField', value)}
          value={formik.values.IdField}
          error={formik.errors.IdField}
          columns={column}
          height={`${expanded ? `calc(100vh - 280px)` : `${height-100}px`}`}
        />
      </Box>
    </FormShell>
  )
}

export default IdFieldsForm
