import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { AdministrationRepository } from 'src/repositories/AdministrationRepository'
import { useWindow } from 'src/windows'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import TextEditor from 'src/components/Shared/TextEditor'
import { convertToRaw, EditorState } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import Form from 'src/components/Shared/Form'

export default function TemplateBodyForm({ labels, maxAccess, recordId, languageId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty())
  const [decodedHtmlForEditor, setDecodedHtmlForEditor] = useState('')

  const invalidate = useInvalidate({
    endpointId: AdministrationRepository.TemplateBody.qry
  })

  function encodeHtml(html) {
    const protectedHtml = html.replace(/\+/g, '%2B')

    return encodeURIComponent(protectedHtml)
  }

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      teId: recordId,
      name: '',
      textBody: '',
      subject: '',
      languageId: ''
    },
    maxAccess,
    validationSchema: yup.object({
      languageId: yup.number().required(),
      subject: yup.string().required()
    }),
    onSubmit: async obj => {
      const html = draftToHtml(convertToRaw(editorState.getCurrentContent()))

      await postRequest({
        extension: AdministrationRepository.TemplateBody.set,
        record: JSON.stringify({
          ...obj,
          teId: recordId,
          textBody: encodeHtml(html)
        })
      })

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
      window.close()
    }
  })

  function decodeHtml(textBody) {
    if (!textBody) return ''
    try {
      return decodeURIComponent(textBody.replace(/\+/g, '%2B'))
    } catch {
      return textBody
    }
  }

  useEffect(() => {
    ;(async function () {
      if (recordId && languageId) {
        const res = await getRequest({
          extension: AdministrationRepository.TemplateBody.get,
          parameters: `_teId=${recordId}&_languageId=${languageId}`
        })

        const decodedHTML = res?.record?.textBody ? decodeHtml(res.record.textBody) : ''

        setDecodedHtmlForEditor(decodedHTML)

        formik.setValues({
          ...res.record,
          textBody: decodedHTML
        })
      }
    })()
  }, [])

  const editMode = !!formik.values.recordId

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} disabledSubmit={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.LANGUAGE}
                name='languageId'
                label={labels.language}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                onChange={(_, newValue) => formik.setFieldValue('languageId', newValue?.key || '')}
                error={formik.touched.languageId && Boolean(formik.errors.languageId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='subject'
                label={labels.subject}
                value={formik.values?.subject}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('subject', '')}
                error={formik.touched.subject && Boolean(formik.errors.subject)}
                maxLength={30}
              />
            </Grid>
            <TextEditor value={decodedHtmlForEditor} onChange={setEditorState} />
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
