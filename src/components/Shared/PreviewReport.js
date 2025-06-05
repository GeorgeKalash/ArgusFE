import React from 'react'

export default function PreviewReport({ pdf }) {
  return <>{pdf && <iframe src={pdf} width='100%' height='500px' title='Report Preview' />}</>
}
