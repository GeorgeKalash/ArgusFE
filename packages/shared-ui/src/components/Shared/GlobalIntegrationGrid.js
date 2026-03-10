import { useContext, useEffect } from 'react'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { GeneralLedgerRepository } from '@argus/repositories/src/repositories/GeneralLedgerRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import Form from './Form'

const GlobalIntegrationGrid = ({ masterSource, masterId, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.IntegrationAccount, window })

  const { labels: _labels, access } = useResourceQuery({
    datasetId: ResourceIds.IntegrationAccount
  })

  const { formik } = useForm({
    maxAccess: access,
    validateOnChange: true,
    initialValues: {
      Integrations: [
        {
          id: 1,
          postTypeId: null,
          ptName: '',
          accountId: 0,
          accountRef: null,
          accountName: '',
          masterId: '',
          masterSource: ''
        }
      ]
    },
    onSubmit: async values => {
      await postIntegrations(values)
    }
  })

  const postIntegrations = async values => {
    const filteredIntegrations = values.Integrations.filter(
      integration => integration.accountId !== null && integration.accountId !== ''
    )

    const data = {
      masterSource: masterSource,
      masterId: masterId,
      integrationAccounts: filteredIntegrations.map(({ masterSource, masterId, ...rest }) => ({
        masterId,
        masterSource,
        ...rest
      }))
    }

    await postRequest({
      extension: GeneralLedgerRepository.IntegrationAccounts.set2,
      record: JSON.stringify(data)
    }).then(res => {
      toast.success('Record Successfully Saved')
    })
  }

  const column = [
    {
      component: 'textfield',
      label: _labels.ptName,
      name: 'ptName',
      props: { readOnly: true }
    },
    {
      component: 'resourcelookup',
      label: _labels.account,
      name: 'accountRef',
      props: {
        endpointId: GeneralLedgerRepository.ChartOfAccounts.snapshot,
        valueField: 'recordId',
        displayField: 'accountRef',
        displayFieldWidth: 2,
        mapping: [
          { from: 'name', to: 'accountName' },
          { from: 'accountRef', to: 'accountRef' },
          { from: 'recordId', to: 'accountId' }
        ],
        columnsInDropDown: [
          { key: 'accountRef', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    },
    {
      component: 'textfield',
      label: _labels.accountName,
      name: 'accountName',
      props: { readOnly: true }
    }
  ]

  useEffect(() => {
    fetchAndSetData()
  }, [])
  async function fetchAndSetData() {
    const postTypesResponse = await getRequest({
      extension: GeneralLedgerRepository.IntegrationPostTypes.qry,
      parameters: ``
    })

    const integrationsResponse = await getRequest({
      extension: GeneralLedgerRepository.IntegrationAccounts.qry,
      parameters: ``
    })

    if (postTypesResponse.list.length > 0) {
      const integrations = integrationsResponse.list.filter(
        rest => rest.masterSource == masterSource && rest.masterId == masterId
      )

      const postTypes = postTypesResponse.list.map((record, index) => {
        const integration = integrations.find(int => int.postTypeId === record.recordId)

        return {
          masterId: masterId,
          masterSource: masterSource,
          id: index,
          postTypeId: record.recordId,
          ptName: record.name,
          accountId: integration?.accountId || null,
          accountRef: integration?.accountRef || null,
          accountName: integration?.accountName || ''
        }
      })

      formik.setValues({ Integrations: postTypes })
    }
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access} isParentWindow={false}>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('Integrations', value)}
            value={formik.values.Integrations}
            error={formik.errors.Integrations}
            columns={column}
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}
GlobalIntegrationGrid.width = 800
GlobalIntegrationGrid.height = 500

export default GlobalIntegrationGrid
