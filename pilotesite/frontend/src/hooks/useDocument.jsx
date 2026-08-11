import { createContext, useContext, useState } from 'react'

const DocumentContext = createContext(null)

export function DocumentProvider({ children }) {
  const [activeDocument, setActiveDocument] = useState(null)

  function openDocument(doc) {
    setActiveDocument(doc)
  }

  function closeDocument() {
    setActiveDocument(null)
  }

  return (
    <DocumentContext.Provider value={{ activeDocument, openDocument, closeDocument }}>
      {children}
    </DocumentContext.Provider>
  )
}

export function useDocument() {
  const ctx = useContext(DocumentContext)
  if (!ctx) throw new Error('useDocument doit être utilisé dans DocumentProvider')
  return ctx
}
