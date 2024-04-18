import { Box } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { useResourceQuery } from 'src/hooks/resource'

const GlobalIntegration = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { postTypes, setPostTypes } = useState([])

  const {
    query: { data },
    labels: _labels,
    access,
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: GeneralLedgerRepository.IntegrationPostTypes.qry,
    datasetId: ResourceIds.IntegrationAccount,
  })

  async function fetchGridData(options={}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams

     const response =  await getRequest({
      extension: GeneralLedgerRepository.IntegrationPostTypes.page,
      parameters: parameters
    })

    return {...response,  _startAt: _startAt}
  }

  const {formik} = useForm({
      maxAccess:access,
      enableReinitialize: false,
      validateOnChange: true,
      initialValues: {
        masterSource:null,
        masterId: null,
        Integrations:[
          {
            id: 1, 
            postTypeId: null,
            ptName: '',
            accountId: null,
            accountRef: null,
            accountName: ''
          }
        ]
      },
      onSubmit: values => {
        postIntegrations(values)
      }
    })

    const postIntegrations = obj => { console.log(formik.values)

      const res = obj.Integrations.relations.map(({ rest }) => ({
        ...rest
      }))

    const data = { 
      masterSource: obj.values.masterSource ,
      masterId: obj.values.masterId,
      integrationAccounts: res
    }
  
      postRequest({
        extension: GeneralLedgerRepository.IntegrationPostTypes.set2,
        record: JSON.stringify(data)
      })
        .then(res => {
          toast.success('Record Successfully')
        })
        .catch(error => {})
    }

    const column = [
      {
        component: 'textfield',
        label: '_labels.postTypeId',
        name: 'postTypeId',
        props:{readOnly: true}
      },
      {
        component: 'textfield',
        label: '_labels.ptName',
        name: 'ptName',
        props:{readOnly: true}
      },
      {
        component: 'textfield',
        label: '_labels.accountName',
        name: 'accountName',
        props:{readOnly: true}
      },
      {
        component: 'resourcecombobox',
        label: 'labels.accountRef',
        name: 'accountRef',
        props: {
          endpointId: GeneralLedgerRepository.IntegrationAccounts.qry,
          valueField: 'accountId',
          displayField: 'accountRef',
          mapping: [ { from: 'accountName', to: 'accountName' } ,
          { from: 'accountRef', to: 'accountRef' },
          { from: 'accountId', to: 'accountId' } ],
          columnsInDropDown: [
            { key: 'accountRef', value: 'accountRef' },
            { key: 'accountName', value: 'accountName' },
          ]
        }
      }
    ]

    useEffect(() => {
      getPostTypes();
    }, []); 

    const getPostTypes = () => {
      getRequest({
        extension: GeneralLedgerRepository.IntegrationPostTypes.qry
      })
      .then(res => {
        if (res.list.length > 0) {
          const postTypes = res.list.map((record, index) => ({
            id: index,
            recordId: record.recordId,
            name: record.name
          }));
          setPostTypes({ postTypes });
        }
      })
      .catch(error => {
      });
      
      getIntegrations()
    }  

    const getIntegrations = () => {
      console.log(postTypes)
      getRequest({
        extension: GeneralLedgerRepository.IntegrationAccounts.qry,
        parameters:`_recordId=0&_classId=0`
      })
      .then(res => {
        formik.setValues({ masterSource: res.masterSource });
        formik.setValues({ masterId: res.masterId });
        if (res.list.length > 0) {
          const Integrations = res.list.map((rest, index) => ({
            id: index,
            ...rest
          }));
          
          formik.setValues({ Integrations: Integrations });
        }
      })
      .catch(error => {
      });
    }    

  return (
    <FormShell 
      form={formik}
      resourceId={ResourceIds.Accounts}

      // maxAccess={access}
      infoVisible={false}>
        
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', scroll: 'none', overflow:'hidden' }}>
        <DataGrid   
           onChange={value => formik.setFieldValue('Integrations', value)}
           value={formik.values.Integrations}
           error={formik.errors.Integrations}
           columns={column}
           allowDelete={false}
           allowAddNewLine={false}

        />
      </Box>
    </FormShell>
  )
}

export default GlobalIntegration