"use client"

import { useState } from "react"
import { UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
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

    try {
      setIsUploading(true)
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const schema = JSON.parse(e.target?.result as string)
          
          if (!validateSchema(schema)) {
            throw new Error('Invalid schema format');
          }

          await api.post("/malay2sql/initialize", { schema })
          toast.success(
            "Schema uploaded successfully. You can now start querying in Malay language!"
          )
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || error.message;
          throw new Error(`Failed to upload schema: ${errorMessage}`);
        }
      }

      reader.readAsText(file)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="relative">
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
        <UploadCloud className="mr-2 h-4 w-4" />
        {isUploading ? "Uploading..." : "Upload JSON File"}
      </Button>
    </div>
  )
} 