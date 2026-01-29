import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { AdministrationRepository } from '@argus/repositories/src/repositories/AdministrationRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { convertToRaw, EditorState } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import { convertFromHTML } from 'draft-convert'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import TextEditor from '@argus/shared-ui/src/components/Shared/TextEditor'

export default function TemplateBodyForm({ labels, maxAccess, recordId, languageId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty())
  const [decodedHtmlForEditor, setDecodedHtmlForEditor] = useState('')

  const invalidate = useInvalidate({
    endpointId: AdministrationRepository.TemplateBody.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      teId: recordId,
      name: '',
      textBody: '',
      subject: '',
      languageId: null
    },
    maxAccess,
    validationSchema: yup.object({
      languageId: yup.number().required(),
      subject: yup.string().required()
    }),
    onSubmit: async obj => {
      const contentState = editorState.getCurrentContent()
      const plainText = contentState.getPlainText().trim()

      const html = plainText
        ? draftToHtml(convertToRaw(contentState))
        : ''

      await postRequest({
        extension: AdministrationRepository.TemplateBody.set,
        record: JSON.stringify({
          ...obj,
          teId: recordId,
          textBody: html ? encodeURIComponent(html) : ''
        })
      })

      toast.success(!languageId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
      window.close()
    }
  })

  function decodeHtml(textBody) {
    if (!textBody) return ''

    if (/%u[0-9A-Fa-f]{4}/.test(textBody)) {
      return unescape(textBody)
    }

    try {
      return decodeURIComponent(textBody)
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

        const decodedHTML = res?.record?.textBody
          ? decodeHtml(res.record.textBody)
          : ''

        setDecodedHtmlForEditor(decodedHTML)

        formik.setValues({
          ...res.record,
          textBody: decodedHTML
        })

        if (decodedHTML) {
          const contentState = convertFromHTML({
            htmlToEntity: (nodeName, node, createEntity) => {
              if (nodeName === 'img') {
                const img = createEntity('IMAGE', 'IMMUTABLE', {
                  src: node.getAttribute('src'),
                  alt: node.getAttribute('alt'),
                  style: node.getAttribute('style')
                })

                return img
              }

              if (nodeName === 'a') {
                const text = node.textContent || ''

                if (/^#.+#$/.test(text)) {
                  return null
                }

                return createEntity('LINK', 'MUTABLE', {
                  url: node.getAttribute('href')
                })
              }
            },
            htmlToBlock: (nodeName, node) => {
              if (nodeName === 'img') {
                return {
                  type: 'atomic',
                  data: {}
                }
              }
              if (node.style && node.style.textAlign) {
                const alignment = node.style.textAlign

                return {
                  type: nodeName === 'li' ? 'unordered-list-item' : nodeName === 'p' ? 'unstyled' : null,
                  data: { 'text-align': alignment }
                }
              }

              return null
            },
            htmlToStyle: (nodeName, node, currentStyle) => {
              if (node.style.color) {
                currentStyle = currentStyle.add(`color-${node.style.color}`)
              }
              if (nodeName === 'ins') {
                currentStyle = currentStyle.add('UNDERLINE')
              }

              if (node.style.fontSize) {
                const size = node.style.fontSize.replace('px', '')
                currentStyle = currentStyle.add(`fontsize-${size}`)
              }

              if (node.style.fontFamily) {
                const family = node.style.fontFamily.replace(/["']/g, '')
                currentStyle = currentStyle.add(`fontfamily-${family}`)
              }

              if (node.style.backgroundColor) {
                const bg = node.style.backgroundColor.replace(/\s+/g, '').replace(/;/g, '')
                currentStyle = currentStyle.add(`bgcolor-${bg}`)
              }

              return currentStyle
            }
          })(decodedHTML)

          const newState = EditorState.createWithContent(contentState)
          setEditorState(newState)
        } else {
          setEditorState(EditorState.createEmpty())
        }
      }
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
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
                maxAccess={maxAccess}
                required
                onChange={(_, newValue) => formik.setFieldValue('languageId', newValue?.key || null)}
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
            <TextEditor value={decodedHtmlForEditor} onChange={setEditorState}/>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}