import { Box } from '@mui/material'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { useResourceQuery } from 'src/hooks/resource'

const GlobalIntegrationGrid = ({ masterSource, masterId}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const {
    labels: _labels,
    access,
  } = useResourceQuery({
    datasetId: ResourceIds.IntegrationAccount,
  })

  const { formik } = useForm({
    maxAccess: access,
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      Integrations: [
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
      postIntegrations(values);
    }
  });
  
  const postIntegrations = values => {
    
    const filteredIntegrations = values.Integrations.filter(integration => integration.accountId !== null);

    const data = { 
      masterSource: masterSource,
      masterId: masterId,
      integrationAccounts: filteredIntegrations
    };

    postRequest({
      extension: GeneralLedgerRepository.IntegrationAccounts.set2,
      record: JSON.stringify(data)
    })
    .then(res => {
      toast.success('Record Successfully Saved');
    })
    .catch(error => { });
  };
  
    const column = [
      {
        component: 'textfield',
        label: _labels.ptName,
        name: 'ptName',
        props:{readOnly: true}
      },
      {
        component: 'resourcecombobox',
        label: _labels.account,
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
      },
      {
        component: 'textfield',
        label: _labels.accountName,
        name: 'accountName',
        props:{readOnly: true}
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
            postTypeId: record.recordId,
            ptName: record.name,
            accountId: null,
            accountRef: null,
            accountName: ''
          }));
          getIntegrations(postTypes); 
        }
      })
      .catch(error => {
        console.error("Failed to fetch post types:", error);
      });
    };
    
    const getIntegrations = (postTypes) => {
      getRequest({
        extension: GeneralLedgerRepository.IntegrationAccounts.qry
      })
      .then(res => {
        if (res.list.length > 0) {
          const integrations = res.list
            .filter(rest => rest.masterSource === masterSource && rest.masterId === masterId)
            .map((rest, index) => ({
              id: index,
              ...rest
            }));
    
          const mergedIntegrations = postTypes.map(pt => {
            const integration = integrations.find(int => int.postTypeId === pt.postTypeId);
            if (integration) {
              return {
                ...pt,
                accountId: integration.accountId,
                accountRef: integration.accountRef,
                accountName: integration.accountName
              };
            }
            
            return pt;  
          });
    
          formik.setValues({ Integrations: mergedIntegrations }); 
        }
      })
      .catch(error => {
        console.error("Failed to fetch integrations:", error);
      });
    };
    
  return (
    <FormShell 
      form={formik}
      resourceId={ResourceIds.Accounts}
      maxAccess={access}
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

export default GlobalIntegrationGrid