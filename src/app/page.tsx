"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { User, UploadCloud, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@/contexts/UserContext"
import Chat from "@/components/chat"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/file-upload"

export default function Dashboard() {
  const { theme, setTheme } = useTheme()
  const { user, fetchUser, isLoading, logout } = useUser()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      if (!token || !user) {
        router.push('/login')
        return;
      }
      
      if (!isAuthenticated && !isLoading) {
        await fetchUser()
        setIsAuthenticated(true)
      }
    }
    checkAuth()
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = () => {
    logout()
    setIsAuthenticated(false)
    router.push('/login')
  }

  const handleProfileSettings = () => {
    router.push('/profile')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="hidden w-64 flex-col border-r bg-muted/40 p-6 lg:flex">
        <div className="flex items-center gap-2 pb-6">
          <User className="h-6 w-6" />
          <h1 className="text-lg font-semibold">Malay2SQL</h1>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg?height=80&width=80" alt={`${user?.first_name}'s profile picture`} />
            <AvatarFallback>{user ? `${user.first_name[0]}${user.last_name[0]}` : 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold">{user ? `${user.first_name} ${user.last_name}` : 'Loading...'}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Separator className="my-4" />
        <nav className="flex flex-1 flex-col gap-2">
          <FileUpload />
        </nav>
        <div className="pt-6 gap-2 flex flex-col">
          <Separator className="my-4" />
          <Button variant="outline" className="w-full justify-start" onClick={handleProfileSettings}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden p-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <Chat />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}