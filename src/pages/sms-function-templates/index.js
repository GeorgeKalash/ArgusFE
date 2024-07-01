import { useState, useContext } from 'react'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'

const SmsFunctionTemplate = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [initialValues, setData] = useState({ rows: [] })

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues,
    onSubmit: values => {
      postSmsFunctionTemplates(values.rows)
    }
  })

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
        templateName: null
      }

      const matchingTemplate = resSmsFunctionTemplate.list.find(y => n.functionId === y.functionId)

      if (matchingTemplate) {
        n.templateId = matchingTemplate.templateId
        n.templateName = matchingTemplate.templateName
      }

      return n
    })

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
    })
  }

  const { labels: _labels } = useResourceQuery({
    queryFn: getGridData,
    datasetId: ResourceIds.SmsFunctionTemplates
  })

  const columns = [
    {
      component: 'textfield',
      label: _labels[1],
      name: 'functionId',
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
      }
    },
    {
      component: 'resourcelookup',
      label: _labels[3],
      name: 'template',
      props: {
        endpointId: SystemRepository.SMSTemplate.snapshot,
        displayField: 'name',
        valueField: 'name',
        columnsInDropDown: [{ key: 'name', value: 'Name' }]

        // width: 50
      },
      onChange({ row: { update, newRow } }) {
        update({
          recordId: newRow?.template?.recordId,
          name: newRow?.template?.name
        })
      }
    }
  ]

  const postSmsFunctionTemplates = values => {
    const obj = {
      smsFunctionTemplates: values
        .map(({ functionId, template }) => ({
          functionId,
          templateId: template?.recordId,
          templateName: template?.name
        }))
        .filter(row => row.templateId != null)
    }
    postRequest({
      extension: SystemRepository.SMSFunctionTemplate.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Updated Successfully')
      })
      .catch(error => {})
  }

  return (
    <FormShell resourceId={ResourceIds.SmsFunctionTemplates} form={formik} isInfo={false} isCleared={false}>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('rows', value)}
            value={formik.values.rows}
            error={formik.errors.rows}
            columns={columns}
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default SmsFunctionTemplate
