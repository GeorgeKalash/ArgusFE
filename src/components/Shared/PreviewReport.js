import React, { useContext } from 'react'
import useSetWindow from 'src/hooks/useSetWindow'
import { ControlContext } from 'src/providers/ControlContext'

export default function PreviewReport({ pdf, window }) {
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.PreviewReport, window })

  return <>{pdf && <iframe src={pdf} width='100%' height='500px' title='Report Preview' />}</>
}

PreviewReport.width = 1000
PreviewReport.height = 500
