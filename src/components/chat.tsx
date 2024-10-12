"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { User, Bot, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'

type Message = {
  id: number
  type: 'user' | 'ai'
  content: string
}

const SkeletonLoader = () => (
  <div className="flex justify-start mb-4">
    <Card className="max-w-[80%] bg-secondary">
      <CardContent className="p-3">
        <div className="flex items-start">
          <Bot className="mr-2 h-5 w-5 mt-0.5 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = () => {
    if (input.trim()) {
      const newUserMessage: Message = { id: Date.now(), type: 'user', content: input }
      setMessages(prev => [...prev, newUserMessage])
      setInput('')
      setIsLoading(true)

      // Simulate AI response
      setTimeout(() => {
        const newAiMessage: Message = { 
          id: Date.now(),
          type: 'ai', 
          content: `Here's your SQL query:\n\n\`\`\`sql\nSELECT * FROM users WHERE name = '${input}';\n\`\`\`` 
        }
        setMessages(prev => [...prev, newAiMessage])
        setIsLoading(false)
      }, 2000)
    }
  }

  const renderMessage = (message: Message) => {
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <Card className={`max-w-[80%] ${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
          <CardContent className="p-3">
            <div className="flex items-start">
              {message.type === 'ai' && <Bot className="mr-2 h-5 w-5 mt-0.5" />}
              <div>
                {message.content.split('```').map((part, i) => 
                  i % 2 === 0 ? (
                    <p key={i} className="text-sm">{part}</p>
                  ) : (
                    <pre key={i} className="bg-muted p-2 rounded-md mt-2 mb-2 overflow-x-auto">
                      <code>{part}</code>
                    </pre>
                  )
                )}
              </div>
              {message.type === 'user' && <User className="ml-2 h-5 w-5 mt-0.5" />}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  useEffect(() => {
    const scrollArea = document.querySelector('.scroll-area-viewport')
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight
    }
  }, [messages])

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-grow mb-4 scroll-area-viewport">
        <div className="p-4">
          <AnimatePresence>
            {messages.map(renderMessage)}
          </AnimatePresence>
          {isLoading && <SkeletonLoader />}
        </div>
      </ScrollArea>
      <div className="flex items-center space-x-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your Malay query here..."
          className="flex-grow"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
        />
        <Button onClick={handleSend} size="icon">
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  )
}