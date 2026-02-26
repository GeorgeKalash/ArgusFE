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
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const FinancialIntegrators = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const getGridData = async () => {
    const res = await getRequest({
      extension: SaleRepository.FinancialIntegrators.qry,
      parameters: `_filter=`
    })
    formik.setValues({
      ...formik.values,
      rows: res.list.map(({ ...rest }, index) => ({
        id: index + 1,
        ...rest
      }))
    })
  }

  const { labels, access } = useResourceQuery({
    queryFn: getGridData,
    datasetId: ResourceIds.FinancialIntegrators
  })

  const { formik } = useForm({
    maxAccess: access,
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      rows: []
    },
    onSubmit: async values => {
      await Promise.all(
        values.rows.map(row =>
          postRequest({
            extension: SaleRepository.FinancialIntegrators.set,
            record: JSON.stringify(row)
          })
        )
      )

      toast.success(platformLabels.Updated)
      await getGridData()
    }
  })

  const columns = [
    {
      component: 'resourcecombobox',
      name: 'cgId',
      label: labels.clientGroup,
      props: {
        valueField: 'recordId',
        displayField: 'name',
        mapping: [
          { from: 'recordId', to: 'cgId' },
          { from: 'name', to: 'cgName' }
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
    <Form onSave={formik.handleSubmit} maxAccess={access} fullSize>
      <VertLayout>
        <Grow>
          <DataGrid
            name='rows'
            onChange={value => {
              formik.setFieldValue('rows', value)
            }}
            value={formik.values?.rows}
            error={formik.errors?.rows}
            columns={columns}
            allowDelete={false}
            allowAddNewLine={false}
            maxAccess={access}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default FinancialIntegrators
