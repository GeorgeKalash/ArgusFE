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
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import TextEditor from 'src/components/Shared/TextEditor'
import { ContentState, convertToRaw, EditorState, convertFromRaw } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import { convertFromHTML } from 'draft-convert'
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
      languageId: null
    },
    maxAccess,
    validationSchema: yup.object({
      languageId: yup.number().required(),
      subject: yup.string().required()
    }),
    onSubmit: async obj => {
      const html = draftToHtml(convertToRaw(editorState.getCurrentContent()), {
        entityStyleFn: entity => {
          const type = entity.get('type')
          const data = entity.getData()

          if (type === 'LINK') {
            return {
              element: 'a',
              attributes: { href: data.url },
              style: {}
            }
          }
        }
      })

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
              console.log(node.style)
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
            <TextEditor value={decodedHtmlForEditor} onChange={setEditorState} />
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
