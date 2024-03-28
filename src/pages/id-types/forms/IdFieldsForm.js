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
          idtId: recordId || null, 
          accessLevel:'',
          controlId: '',
          accessLevelId: '',
          accessLevelName: ''
        }
      ]
    },
    onSubmit: values => {console.log(values.rows)
      postIdFields(values)
    }
  })

  const postIdFields = obj => {console.log(obj.rows)
    const typesRows= obj?.rows

    const data = {
      idtId: recordId,
      typesRows : typesRows.map(
        ({ accessLevel, idtId, ...rest }) => 
        ({
          idtId: recordId,
          ...rest
        })
      )
    }
    postRequest({
      extension: CurrencyTradingSettingsRepository.IdFields.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
          setStore(prevStore => ({
            ...prevStore,
              rows: typesRows
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
      const rowsWithId = res.list.map(item => ({ ...item, id: item.idtId }));
      if (rowsWithId.length > 0) {
        formik.setValues({ rows: rowsWithId });
      } else {
        formik.setValues({
          rows: [
            {
              id: 1 ,
              idtId: '', 
              controlId: '',
              accessLevelId: '',
              accessLevelName: ''
            }
          ]
        });
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
                if(!newRow?.accessLevel?.recordId){
                return;
                }else{
                  update({
                    'controlId':newRow?.controlId,
                    'accessLevelName':newRow?.accessLevel?.value,
                    'accessLevelId': newRow?.accessLevel?.recordId 
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
