import { useEffect } from 'react'

export default function useSetWindow({ title, window }) {
  useEffect(() => {
    if (title) {
      window.setTitle(title)
    }
  }, [title])
}
