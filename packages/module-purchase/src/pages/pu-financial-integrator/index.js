import { useContext } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { PurchaseRepository } from '@argus/repositories/src/repositories/PurchaseRepository'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const PUFinancialIntegrators = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const getGridData = async () => {
    const res = await getRequest({
      extension: PurchaseRepository.FinancialGroup.qry,
      parameters: `_filter=`
    })
    formik.setValues({
      ...formik.values,
      items: res.list.map(({ sameNumber, ...rest }, index) => ({
        ...rest,
        id: index + 1,
        sameNumber: sameNumber || false
      }))
    })
  }

  const { labels, maxAccess } = useResourceQuery({
    queryFn: getGridData,
    datasetId: ResourceIds.PUFinancialIntegrators
  })

  const { formik } = useForm({
    maxAccess,
    validateOnChange: true,
    initialValues: {
      items: []
    },
    onSubmit: async values => {
      await postRequest({
        extension: PurchaseRepository.FinancialGroup.set2,
        record: JSON.stringify(values)
      })

      toast.success(platformLabels.Updated)
      await getGridData()
    }
  })

  const columns = [
    {
      component: 'resourcecombobox',
      name: 'groupId',
      label: labels.vendorGroup,
      props: {
        valueField: 'recordId',
        displayField: 'name',
        mapping: [
          { from: 'recordId', to: 'groupId' },
          { from: 'name', to: 'groupName' }
        ],
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      name: 'fgId',
      label: labels.financialGroup,
      props: {
        endpointId: FinancialRepository.Group.qry,
        valueField: 'recordId',
        displayField: 'name',
        mapping: [
          { from: 'recordId', to: 'fgId' },
          { from: 'name', to: 'fgName' },
          { from: 'reference', to: 'fgRef' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    },
    {
      component: 'checkbox',
      name: 'sameNumber',
      label: labels.sameNumber
    }
  ]

  return (
    <Form onSave={formik.handleSubmit} fullSize>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => {
              formik.setFieldValue('items', value)
            }}
            name='financialIntegrator'
            value={formik.values?.items}
            error={formik.errors?.items}
            columns={columns}
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default PUFinancialIntegrators
