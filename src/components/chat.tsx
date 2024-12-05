"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { User, Bot, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/axios'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

type Message = {
  id: number
  type: 'user' | 'ai'
  content: string
}

interface QueryResult {
  malay_query: string;
  english_translation: string;
  sql_query: string;
  relevant_columns: Record<string, string>;
  execution_time: number;
  timestamp: string;
}

type CodeProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  inline?: boolean;
  node?: any;
}

const SkeletonLoader = () => (
  <div className="flex justify-start mb-4">
    <Card className="max-w-[80%] bg-secondary">
      <CardContent className="p-3">
        <div className="flex items-start">
          <Bot className="mr-2 h-5 w-5 mt-0.5 animate-pulse" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
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
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleSend = async () => {
    if (input.trim()) {
      const newUserMessage: Message = { id: Date.now(), type: 'user', content: input }
      setMessages(prev => [...prev, newUserMessage])
      setInput('')
      setIsLoading(true)

      try {
        const response = await api.post<QueryResult>('/malay2sql/query', {
          query: input
        });

        const relevantColumnsText = Object.entries(response.data.relevant_columns)
          .map(([col, desc]) => `- ${col}: ${desc}`)
          .join('\n');

        const formattedResponse = `
Malay Query: ${response.data.malay_query}

English Translation: ${response.data.english_translation}

Relevant Columns:
${relevantColumnsText}

SQL Query:
\`\`\`sql
${response.data.sql_query}
\`\`\`

Execution Time: ${response.data.execution_time.toFixed(2)}s`;

        const newAiMessage: Message = {
          id: Date.now(),
          type: 'ai',
          content: formattedResponse
        };

        setMessages(prev => [...prev, newAiMessage]);
      } catch (error: any) {
        console.error('Error processing query:', error);
        const errorMessage = error.response?.data?.detail || 'Failed to process query';
        toast.error(`Error: ${errorMessage}`);
        
        const errorAiMessage: Message = {
          id: Date.now(),
          type: 'ai',
          content: `Error: ${errorMessage}. Please ensure you have uploaded a valid schema file first.`
        };
        setMessages(prev => [...prev, errorAiMessage]);
      } finally {
        setIsLoading(false);
      }
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
              <div className="flex-grow">
                <ReactMarkdown
                  components={{
                    code: ({ node, inline, className, children, ...props }: CodeProps) => {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          children={String(children).replace(/\n$/, '')}
                        >
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              {message.type === 'user' && <User className="ml-2 h-5 w-5 mt-0.5" />}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow mb-4" ref={scrollAreaRef}>
        <div className="p-4">
          <AnimatePresence>
            {messages.map(renderMessage)}
          </AnimatePresence>
          {isLoading && <SkeletonLoader />}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
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
    </div>
  )
}

