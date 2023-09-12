'use client'

import { useChat } from 'ai/react'
import { useEffect, useState } from 'react'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'

import styles from './page.module.css'

export default function Home() {
  const { handleInputChange, handleSubmit, input, messages, data } = useChat()

  const [imageUrl, setImageUrl] = useState('')
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (data && data[0]) {
      setTitle(data[0].title)
      setImageUrl(data[0].imageUrl)
    }
  }, [data])

  if (messages && messages.length) {
    return (
      <div className={styles.content}>
        <h1>{title ? title : 'Generating Recipe...'}</h1>
        <img src={imageUrl} />
        <div className={styles.recipe}>
          {messages
            .filter((m) => m.role === 'assistant')
            .map((m, index) => (
              <ReactMarkdown key={index}>{m.content}</ReactMarkdown>
            ))}
        </div>
      </div>
    )
  }

  return (
    <form className={styles.content} onSubmit={handleSubmit}>
      <h1>VeganizeAI</h1>
      <p>Veganize any recipe with AI</p>
      <textarea
        className={styles.textarea}
        onChange={handleInputChange}
        placeholder="Enter your recipe..."
        value={input}
      />
      <button className={styles.button}>Veganize It!</button>
    </form>
  )
}
