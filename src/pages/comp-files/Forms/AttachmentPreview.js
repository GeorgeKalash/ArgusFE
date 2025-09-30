import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'

const AttachmentPreview = ({ url, labels }) => {
  if (!url) return null

  return (
    <VertLayout>
      <Grow>
        <img
          src={url}
          alt='Attachment preview'
          style={{
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        />
      </Grow>
    </VertLayout>
  )
}

export default AttachmentPreview
