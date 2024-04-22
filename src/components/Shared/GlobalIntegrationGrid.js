import { Box, Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { useResourceQuery } from 'src/hooks/resource'
import WindowToolbar from './WindowToolbar'

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
          accountId: 0,
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
    
    const filteredIntegrations = values.Integrations.filter(integration => integration.accountId !== null && integration.accountId !== '');

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
        component: 'resourcelookup',
        label: _labels.account,
        name: 'accountRef',
        props: {
          endpointId: GeneralLedgerRepository.ChartOfAccounts.snapshot,
          valueField: 'recordId',
          displayField: 'accountRef',
          mapping: 
          [ 
            { from: 'name', to: 'accountName' } ,
            { from: 'accountRef', to: 'accountRef' },
            { from: 'recordId', to: 'accountId' } 
          ],
          columnsInDropDown: 
          [
            { key: 'accountRef', value: 'accountRef' },
            { key: 'name', value: 'accountName' },
          ],
        },
      },
      {
        component: 'textfield',
        label: _labels.accountName,
        name: 'accountName',
        props:{readOnly: true}
      }
    ]

    useEffect(() => {
      fetchAndSetData();
    }, []); 
    
    async function fetchAndSetData() {
      try {
        const postTypesResponse = await getRequest({
          extension: GeneralLedgerRepository.IntegrationPostTypes.qry
        });

        const integrationsResponse = await getRequest({
          extension: GeneralLedgerRepository.IntegrationAccounts.qry
        });

        if (postTypesResponse.list.length > 0) {
          const integrations = integrationsResponse.list
            .filter(rest => rest.masterSource === masterSource && rest.masterId === masterId);

          const postTypes = postTypesResponse.list.map((record, index) => {
            const integration = integrations.find(int => int.postTypeId === record.recordId);

            return {
              id: index,
              postTypeId: record.recordId,
              ptName: record.name,
              accountId: integration?.accountId || null,
              accountRef: integration?.accountRef || null,
              accountName: integration?.accountName || ''
            };
          });

          formik.setValues({ Integrations: postTypes });
        }
      } catch (error) {}
    }
    
  return (
    <Box
    sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    }}
    >
        <DataGrid   
           onChange={value => formik.setFieldValue('Integrations', value)}
           value={formik.values.Integrations}
           error={formik.errors.Integrations}
           columns={column}
           allowDelete={false}
           allowAddNewLine={false}

        />
        <Grid sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          padding: 3,
          textAlign: 'center',
        }}>
          <WindowToolbar 
            onSave={formik.handleSubmit}
            isSaved={true}
          />
      </Grid>
    </Box>
  )
}

export default GlobalIntegrationGrid