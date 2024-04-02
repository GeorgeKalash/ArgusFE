import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'

// ** Custom Imports
import { RequestsContext } from 'src/providers/RequestsContext'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'
import { DataSets } from 'src/resources/DataSets'

const IdFieldsForm = ({
  store,
  maxAccess,
  labels,
  expanded,
  editMode
}) => {
  const {recordId} = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { height } = useWindowDimensions()

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,

    // validationSchema: yup.object({ rows: yup
    //   .array()
    //   .of(
    //     yup.object().shape({
    //       accessLevel: yup
    //         .object()
    //         .shape({
    //           recordId: yup.string().required(' ')
    //         })
    //         .required(' '),
    //     })
    //   ).required(' ') }),
    initialValues: {
      rows: [
        {
          id: 1 ,
          idtId: recordId , 
          accessLevel:'',
          controlId: '',
          accessLevelId: '',
          accessLevelName: ''
        }
      ]
    },
    onSubmit: values => {
      postIdFields(values)
    }
  })

  const postIdFields = obj => {console.log(recordId)

    const data = {
      idtId: recordId,
      list: obj.rows.map(row => ({
        accessLevelName: row.accessLevelName,
        accessLevelId: row.accessLevelId,
        controlId: row.controlId,
      }))
    }
    console.log(data)
    
    postRequest({
      extension: CurrencyTradingSettingsRepository.IdFields.set2,
      record: JSON.stringify(data)
    })
    console.log(data)
      .then(res => {
          setStore(prevStore => ({
          ...prevStore,
          rows: obj?.rows
        }));
            toast.success('Record Edited Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }  

  useEffect(()=>{
    const defaultParams = `_idtId=${recordId}`
    var parameters = defaultParams
    getRequest({
      extension: CurrencyTradingSettingsRepository.IdFields.qry,
      parameters: parameters
    })
    .then(res => {
      if (res?.list?.length > 0) {

        formik.setValues({ countries: res.list.map(
          ({ accessLevelId, accessLevelName, ...rest } , index) => ({
             recordId: idtId,
             accessLevel : { 
             recordId: accessLevelId,
             name: accessLevelName
            },
            accessLevelName: accessLevelName,
            accessLevelId,
             ...rest
          }) )})
          setStore(prevStore => ({
            ...prevStore,
              rows: typesRows
          }));
      } else {
        formik.setValues({
          rows: [
            { 
              id: 1 ,
              idtId: recordId, 
              controlId: '',
              accessLevelId: '',
              accessLevelName: ''
            }
          ]
        })
      }
    })
    .catch(error => {
    })

  },[recordId])

  return (
    <>
      <FormShell
        form={formik}
        resourceId={ResourceIds.IdTypes}
        maxAccess={maxAccess}
        editMode={editMode} 
        isInfo={false}
      >
        <DataGrid
          onChange={value => formik.setFieldValue('rows', value)}
          value={formik.values.rows}
          error={formik.errors.rows}
          columns={[
            {
              component: 'textfield',
              label: labels.control,
              name: 'controlId',
              mandatory: true
            },
            {
              component: 'resourcecombobox',
              name: 'accessLevel',
              label: labels.accessLevel,
                props: {
                  datasetId: DataSets.RT_Language,
                  mandatory:true, 
                  valueField: 'key',
                  displayField: 'value',
                  columnsInDropDown: [
                    { key: 'value', value: 'Value' },
                  ]
                },
              async onChange({ row: { update, newRow } }) {
                if(!newRow?.accessLevel?.key){
                return;
                }else{console.log(newRow)
                  update({
                    'accessLevelName':newRow?.accessLevel?.value,
                    'accessLevelId': newRow?.accessLevel?.key 
                  })
                }
              }
            },
            
          ]}
          height={`${expanded ? height-300 : 350}px`}
        />
      </FormShell>
    </>
  )
}

export default IdFieldsForm
