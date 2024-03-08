import { useEffect, useState, useContext } from 'react'

// ** React ImportsCustomLookup
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import WindowToolbar from 'src/components/Shared/WindowToolbar'

// ** MUI Imports
import { Box, Grid } from '@mui/material'

// ** Third Party Imports
import { Formik, useFormik } from 'formik'
import toast from 'react-hot-toast'
import FormShell from 'src/components/Shared/FormShell'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataGrid } from 'src/components/Shared/DataGrid'

const SmsFunctionTemplate = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { height } = useWindowDimensions()

  //states

  const [initialValues, setData] = useState({rows :[]})


  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues,
    onSubmit:  values => {
      // alert(JSON.stringify(values.rows, null, 2));
      console.log("values----1" , values) // no get  update value

      postSmsFunctionTemplates(values.rows)
    }
  })


  const getGridData = async () => {
    try {
      const parameters = '';

      const resSystemFunctionPromise = await getRequest({
        extension: SystemRepository.SystemFunction.qry,
        parameters: parameters
      });

      const resSmsFunctionTemplatePromise = await getRequest({
        extension: SystemRepository.SMSFunctionTemplate.qry,
        parameters: parameters
      });

      const [resSystemFunction, resSmsFunctionTemplate] = await Promise.all([
        resSystemFunctionPromise,
        resSmsFunctionTemplatePromise
      ]);

      const finalList = resSystemFunction.list.map(x => {
        const n = {
          functionId: parseInt(x.functionId),
          templateId: null,
          functionName: x.sfName,
          templateName: null
        };

        const matchingTemplate = resSmsFunctionTemplate.list.find(
          y => n.functionId === y.functionId
        );

        if (matchingTemplate) {
          n.templateId = matchingTemplate.templateId;
          n.templateName = matchingTemplate.templateName;
        }

        return n;
      });

      formik.setValues({
        ...formik.values,
        rows: finalList.map(({ templateId, templateName, ...rest }, index) => ({
          id: index + 1,
          template: {
            recordId: templateId,
            name: templateName
          },
          ...rest
        }))
      });
    } catch (error) {

return Promise.reject(error);
    }
  };

  const {
    labels: _labels,
  } = useResourceQuery({
    queryFn: getGridData,
    datasetId: ResourceIds.SmsFunctionTemplates
  })

  const columns = [
    {
      component: 'textfield',
      label: _labels[1],
      name: 'functionId',

      // width: 200,
      props: {
      readOnly: true
      }
    },
    {
      component: 'textfield',
      label: _labels[2],
      name: 'functionName',
      props: {
      readOnly: true
      },

      // width: 300
    },{
      component: 'resourcelookup',
      label: _labels[3],
      name: 'template',
      props: {
        endpointId: SystemRepository.SMSTemplate.snapshot,
        displayField: 'name',
        valueField: 'name',
        columnsInDropDown: [
          { key: "reference", value: "Reference" },
          { key: "name", value: "Name" },
        ],
      } ,
       onChange({ row: { update, newRow } }) {

        update({
          recordId : newRow?.template?.recordId,
          name:  newRow?.template?.name,
        })

      },

    },


  ]

  const postSmsFunctionTemplates = (values) => {
    console.log(initialValues)

    const obj = {
      smsFunctionTemplates: values.map(({ functionId, template }) => ({ functionId,
          templateId : template?.recordId ,  templateName : template?.name}))
          .filter(row => row.templateId != null)


    }
    postRequest({
      extension: SystemRepository.SMSFunctionTemplate.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Updated Successfully')
      })
      .catch(error => {
      })
  }

  return (
    <>

         <Box sx={{height: `calc(100vh - 50px)` , display: 'flex',flexDirection: 'column' , zIndex:1}}>
          <FormShell form={formik} infoVisible={false} visibleClear={false}>

            <Grid container>
              <Grid sx={{ width: '100%'  }}>
                <Box sx={{ width: '100%'  }}>
                  <DataGrid
                   height={height-150}
                   onChange={value => formik.setFieldValue('rows', value)}
                   onCellEditStop={value => console.log(value, 'sms')}
                   value={formik.values.rows}
                   error={formik.errors.rows}
                   columns={columns}
                   allowDelete={false}
                   allowAddNewLine={false}
                  />
                </Box>
              </Grid>
            </Grid>
          </FormShell>
          </Box>

    </>
  )
}

export default SmsFunctionTemplate
