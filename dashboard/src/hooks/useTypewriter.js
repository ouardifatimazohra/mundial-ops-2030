/**
 * ✍️ useTypewriter — Hook React pour effet machine à écrire
 * Affiche un texte caractère par caractère avec vitesse configurable
 */

import { useState, useEffect, useRef } from 'react'

export function useTypewriter(text, options = {}) {
  const {
    speed     = 25,       // ms entre chaque caractère
    enabled   = true,     // active ou non l'effet
    onComplete = null,    // callback à la fin
  } = options
  
  const [displayed, setDisplayed] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const indexRef = useRef(0)
  
  useEffect(() => {
    // Reset quand le texte change
    setDisplayed('')
    setIsComplete(false)
    indexRef.current = 0
    
    if (!text) return
    
    // Mode instantané (pas d'effet)
    if (!enabled) {
      setDisplayed(text)
      setIsComplete(true)
      onComplete?.()
      return
    }
    
    // Mode typewriter
    const timer = setInterval(() => {
      if (indexRef.current >= text.length) {
        clearInterval(timer)
        setIsComplete(true)
        onComplete?.()
        return
      }
      
      // Vitesse variable : plus rapide sur les espaces et la ponctuation
      const currentChar = text[indexRef.current]
      setDisplayed(prev => prev + currentChar)
      indexRef.current += 1
    }, speed)
    
    return () => clearInterval(timer)
  }, [text, speed, enabled])
  
  return { displayed, isComplete }
}