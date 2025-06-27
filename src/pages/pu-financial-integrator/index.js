import { useContext } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { ControlContext } from 'src/providers/ControlContext'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'

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
      items: res.list.map(({ ...rest }, index) => ({
        id: index + 1,
        
        ...rest
      }))
    })
  }

  const { labels: labels, maxAccess } = useResourceQuery({
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
    <VertLayout>
      <Grow>
        <DataGrid
          onChange={value => {
            formik.setFieldValue('items', value)
          }}
          value={formik.values?.items}
          error={formik.errors?.items}
          columns={columns}
          allowDelete={false}
          allowAddNewLine={false}
        />
      </Grow>
      <Fixed>
        <WindowToolbar onSave={formik.submitForm} isSaved={true} smallBox={true} />
      </Fixed>
    </VertLayout>
  )
}

export default PUFinancialIntegrators
