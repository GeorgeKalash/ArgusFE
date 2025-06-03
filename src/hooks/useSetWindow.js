import { useEffect } from 'react'

export default function useSetWindow({ labels, window, titleKey }) {
  useEffect(() => {
    if (labels?.[titleKey]) {
      window.setTitle(labels?.[titleKey])
    }
  }, [labels?.[titleKey]])
}
