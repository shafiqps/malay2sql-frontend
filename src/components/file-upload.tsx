"use client"

import { useState } from "react"
import { UploadCloud, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea" 
import { Card, CardContent } from "@/components/ui/card"
import api from '@/lib/axios'

interface SchemaColumn {
  data_type: string;
  description: string;
}

interface SchemaJson {
  table_name: string;
  columns: Record<string, SchemaColumn>;
}

export function FileUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [schemaContent, setSchemaContent] = useState<string>("")

  const validateSchema = (schema: any): schema is SchemaJson => {
    if (!schema.table_name || typeof schema.table_name !== 'string') {
      throw new Error('Schema must include a table_name');
    }
    
    if (!schema.columns || typeof schema.columns !== 'object') {
      throw new Error('Schema must include columns object');
    }

    for (const [columnName, columnInfo] of Object.entries(schema.columns)) {
      if (!columnInfo || typeof columnInfo !== 'object') {
        throw new Error(`Invalid column info for ${columnName}`);
      }

      const column = columnInfo as any;
      if (!column.data_type || !column.description) {
        throw new Error(`Column ${columnName} must have data_type and description`);
      }
    }

    return true;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
  
    if (file.type !== "application/json") {
      toast.error("Please upload a JSON file")
      return
    }
  
    setIsUploading(true)
    
    try {
      // Wrap FileReader in a Promise
      const schema = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        
        reader.onload = (e) => {
          try {
            const result = JSON.parse(e.target?.result as string)
            setSchemaContent(JSON.stringify(result, null, 2))
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }
        
        reader.onerror = () => reject(reader.error)
        reader.readAsText(file)
      })
  
      // Validate and upload schema
      if (!validateSchema(schema)) {
        throw new Error('Invalid schema format')
      }
  
      await api.post("/malay2sql/initialize", { schema })
      toast.success(
        "Schema uploaded successfully. You can now start querying in Malay language!"
      )
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message
      toast.error(`Failed to upload schema: ${errorMessage}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveSchema = async () => {
    setIsUploading(true)
    try {
      const schema = JSON.parse(schemaContent)
      
      if (!validateSchema(schema)) {
        throw new Error('Invalid schema format')
      }

      await api.post("/malay2sql/initialize", { schema })
      toast.success("Schema updated successfully!")
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message
      toast.error(`Failed to update schema: ${errorMessage}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
        <div className="relative mb-4">
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <Button
            variant="outline"
            className="w-full justify-start"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <UploadCloud className="mr-2 h-4 w-4 animate-bounce" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload JSON File
              </>
            )}
          </Button>
        </div>

        {schemaContent && !isUploading && (
          <Card className="w-full flex-1 min-h-0">
            <CardContent className="pt-6 h-full">
              <div className="space-y-4 flex flex-col h-full">
                <Textarea
                  value={schemaContent}
                  onChange={(e) => setSchemaContent(e.target.value)}
                  className="font-mono text-sm flex-1 min-h-0"
                  placeholder="JSON Schema"
                />
                <Button 
                  onClick={handleSaveSchema} 
                  className="w-full"
                  disabled={isUploading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  )
} 