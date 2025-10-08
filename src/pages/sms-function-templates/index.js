import { useContext } from 'react'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import Form from 'src/components/Shared/Form'

const SmsFunctionTemplate = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const getGridData = async () => {
    const parameters = ''

    const resSystemFunction = await getRequest({
      extension: SystemRepository.SystemFunction.qry,
      parameters: parameters
    })

    const resSmsFunctionTemplate = await getRequest({
      extension: SystemRepository.SMSFunctionTemplate.qry,
      parameters: parameters
    })

    const finalList = resSystemFunction.list.map(x => {
      const n = {
        functionId: parseInt(x.functionId),
        templateId: null,
        functionName: x.sfName,
        templateName: '',
        sgId: null,
        sgName: ''
      }

      const matchingTemplate = resSmsFunctionTemplate.list.find(y => n.functionId === y.functionId)

      if (matchingTemplate) {
        n.templateId = matchingTemplate.templateId
        n.templateName = matchingTemplate.templateName
        n.sgId = matchingTemplate.sgId
        n.sgName = matchingTemplate.sgName
      }

      return n
    })

    formik.setValues({
      ...formik.values,
      rows: finalList.map(({ ...rest }, index) => ({
        id: index + 1,
        ...rest
      }))
    })
  }

  const { labels, access } = useResourceQuery({
    queryFn: getGridData,
    datasetId: ResourceIds.SmsFunctionTemplates
  })

  const formik = useFormik({
    maxAccess: access,
    validateOnChange: true,
    initialValues: { rows: [] },
    onSubmit: async values => {
      await postSmsFunctionTemplates(values.rows)
    }
  })

  const columns = [
    {
      component: 'textfield',
      label: labels.FunctionId,
      name: 'functionId',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.Name,
      name: 'functionName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcelookup',
      label: labels.SmsTemplates,
      name: 'templateId',
      props: {
        endpointId: SystemRepository.SMSTemplate.snapshot,
        displayField: 'name',
        valueField: 'recordId',
        columnsInDropDown: [
          { key: 'name', value: 'Name' },
          { key: 'reference', value: 'Reference' }
        ],
        mapping: [
          { from: 'recordId', to: 'templateId' },
          { from: 'name', to: 'templateName' }
        ]
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.securityGrp,
      name: 'sgId',
      propsReducer({ row, props }) {
        return { ...props, readOnly: !row?.templateId }
      },
      props: {
        endpointId: AccessControlRepository.SecurityGroup.qry,
        parameters: '_startAt=0&_pageSize=1000',
        valueField: 'recordId',
        displayField: 'name',
        mapping: [
          { from: 'recordId', to: 'sgId' },
          { from: 'name', to: 'sgName' }
        ],
        displayFieldWidth: 1
      }
    }
  ]

  const postSmsFunctionTemplates = async values => {
    const obj = {
      smsFunctionTemplates: values.filter(row => row.templateId != null)
    }
    await postRequest({
      extension: SystemRepository.SMSFunctionTemplate.set,
      record: JSON.stringify(obj)
    })
    toast.success(platformLabels.Updated)
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access} fullSize>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('rows', value)}
            name='rows'
            value={formik.values.rows}
            error={formik.errors.rows}
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

export default SmsFunctionTemplate
