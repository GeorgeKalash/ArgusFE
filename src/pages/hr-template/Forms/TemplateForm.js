import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { AdministrationRepository } from 'src/repositories/AdministrationRepository'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { useWindow } from 'src/windows'
import TemplateBodyForm from './TemplateBodyForm'

export default function TemplateForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const invalidate = useInvalidate({
    endpointId: AdministrationRepository.AdTemplate.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: ''
    },
    maxAccess,
    validationSchema: yup.object({
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      const res = await postRequest({
        extension: AdministrationRepository.AdTemplate.set,
        record: JSON.stringify(obj)
      })
      formik.setFieldValue('recordId', res.recordId)
      toast.success(!res.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: AdministrationRepository.AdTemplate.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res.record)
      }
    })()
  }, [])

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    if (!recordId) {
      return { list: [], totalCount: 0, _startAt }
    }

    const response = await getRequest({
      extension: AdministrationRepository.TemplateBody.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_teId=${recordId}`
    })

    return { ...response, _startAt: _startAt }
  }

  const editMode = !!formik.values.recordId

  const {
    query: { data },
    invalidate: invalidateBody,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: AdministrationRepository.TemplateBody.qry,
    datasetId: ResourceIds.Template
  })

  const columns = [
    {
      field: 'languageName',
      headerName: labels.language,
      flex: 1
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: AdministrationRepository.TemplateBody.del,
      record: JSON.stringify(obj)
    })
    invalidateBody()
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId, languageId) {
    stack({
      Component: TemplateBodyForm,
      props: {
        labels,
        recordId,
        languageId,
        maxAccess
      },
      width: 850,
      height: 700,
      title: labels?.TemplateBody
    })
  }

  const add = () => {
    openForm(recordId)
  }

  const edit = obj => {
    openForm(obj?.teId, obj?.languageId)
  }

  return (
    <FormShell
      resourceId={ResourceIds.Template}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values?.name}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
                maxLength={30}
              />
            </Grid>
          </Grid>
          <GridToolbar onAdd={add} maxAccess={maxAccess} disableAdd={!editMode} />
          <Table
            name='templateBodyTable'
            columns={columns}
            gridData={data}
            rowId={['recordId']}
            onEdit={edit}
            onDelete={del}
            pageSize={50}
            paginationType='client'
            pagination={false}
            refetch={refetch}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
