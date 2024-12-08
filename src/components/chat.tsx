"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { User, Bot, Send, Globe, Columns, ThumbsUp, ThumbsDown, Play } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/axios'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

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
  execution_result?: any;
}

interface ExecutionResult {
  message: string;
  result: {
    status: string;
    results: any[];
    rows_affected: number;
    execution_time: number;
    query_type: string;
  };
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
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [currentFeedbackQuery, setCurrentFeedbackQuery] = useState<QueryResult | null>(null)
  const [correctedSQL, setCorrectedSQL] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [isExecuting, setIsExecuting] = useState(false)

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
  
        const newAiMessage: Message = {
          id: Date.now(),
          type: 'ai',
          content: JSON.stringify(response.data)
        };
  
        setMessages(prev => [...prev, newAiMessage]);
      } catch (error: any) {
        console.error('Error processing query:', error);
        const errorMessage = error.response?.data?.detail || 'Failed to process query';
        toast.error(`Error: ${errorMessage}`);
        
        // Create error message in the same format as successful responses
        const errorAiMessage: Message = {
          id: Date.now(),
          type: 'ai',
          content: JSON.stringify({
            malay_query: input,
            english_translation: '',
            sql_query: `Error: ${errorMessage}. Please ensure you have uploaded a valid schema file first.`,
            relevant_columns: {},
            execution_time: 0,
            timestamp: new Date().toISOString()
          })
        };
        setMessages(prev => [...prev, errorAiMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  }

  const handleFeedback = (queryResult: QueryResult) => {
    setCurrentFeedbackQuery(queryResult)
    setCorrectedSQL(queryResult.sql_query)
    setFeedbackDialogOpen(true)
  }

  const submitFeedback = async () => {
    if (!currentFeedbackQuery) return

    try {
      await api.post('/malay2sql/feedback', {
        original_query_result: currentFeedbackQuery,
        corrected_sql: correctedSQL
      })
      toast.success('Feedback submitted successfully')
      setFeedbackDialogOpen(false)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('Failed to submit feedback')
    }
  }

  const handleExecute = async (sqlQuery: string) => {
    setIsExecuting(true)
    try {
      const response = await api.post<ExecutionResult>('/malay2sql/execute', {
        sql_query: sqlQuery
      })
      
      const executionMessage: Message = {
        id: Date.now(),
        type: 'ai',
        content: JSON.stringify({
          ...JSON.parse(messages[messages.length - 1].content),
          execution_result: response.data.result
        })
      }
      setMessages(prev => [...prev.slice(0, -1), executionMessage])
      toast.success(response.data.message)
    } catch (error: any) {
      console.error('Error executing query:', error)
      toast.error('Failed to execute query: ' + (error.response?.data?.detail || error.message))
    } finally {
      setIsExecuting(false)
    }
  }

  const renderMessage = (message: Message) => {
    if (message.type === 'user') {
      return (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex justify-end mb-4"
        >
          <Card className="max-w-[80%] bg-primary text-primary-foreground">
            <CardContent className="p-3">
              <div className="flex items-start">
                <div className="flex-grow">{message.content}</div>
                <User className="ml-2 h-5 w-5 mt-0.5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )
    }

    if (message.type === 'ai') {
      const data: QueryResult = JSON.parse(message.content);
      return (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex justify-start mb-4"
        >
          <Card className="max-w-[80%] bg-secondary">
            <CardContent className="p-3">
              <div className="flex items-start">
                <Bot className="mr-2 h-5 w-5 mt-0.5" />
                <div className="flex-grow space-y-2">
                  <ReactMarkdown
                    components={{
                      code: ({ node, inline, className, children, ...props }: CodeProps) => {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {`\`\`\`sql\n${data.sql_query}\n\`\`\``}
                  </ReactMarkdown>
                  <div className="flex space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Globe className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-medium">Translation</h4>
                          <p><strong>Malay Query:</strong> {data.malay_query}</p>
                          <p><strong>English Translation:</strong> {data.english_translation}</p>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Columns className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-medium">Relevant Columns</h4>
                          <ul className="list-disc pl-5">
                            {Object.entries(data.relevant_columns).map(([col, desc]) => (
                              <li key={col}>{col}: {desc}</li>
                            ))}
                          </ul>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button variant="outline" size="icon" onClick={() => handleFeedback(data)}>
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleExecute(data.sql_query)}
                      disabled={isExecuting}
                      className={`relative ${isExecuting ? 'animate-pulse' : ''}`}
                    >
                      <Play className="h-4 w-4" />
                      {isExecuting && (
                        <motion.div
                          className="absolute inset-0 rounded-md bg-primary/10"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.5, 0.2],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                          }}
                        />
                      )}
                    </Button>
                  </div>
                  {data.execution_result && (
                    <div className="mt-2 p-2 bg-secondary/50 rounded-md">
                      <h4 className="font-medium mb-1">Execution Results:</h4>
                      <div className="text-sm mb-2">
                        <span className="font-medium">Query Type:</span> {data.execution_result.query_type}
                        <span className="ml-4 font-medium">Rows Affected:</span> {data.execution_result.rows_affected}
                      </div>
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(data.execution_result.results, null, 2)}
                      </pre>
                      <div className="text-xs text-muted-foreground mt-2">
                        Status: {data.execution_result.status}
                        <span className="ml-4">
                          Execution Time: {data.execution_result.execution_time.toFixed(2)}s
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-2">
                    Execution Time: {data.execution_time.toFixed(2)}s
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )
    }
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
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="original-sql" className="block text-sm font-medium text-gray-700">Original SQL</label>
              <Textarea
                id="original-sql"
                value={currentFeedbackQuery?.sql_query || ''}
                readOnly
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="corrected-sql" className="block text-sm font-medium text-gray-700">Corrected SQL (if needed)</label>
              <Textarea
                id="corrected-sql"
                value={correctedSQL}
                onChange={(e) => setCorrectedSQL(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={submitFeedback}>Submit Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

