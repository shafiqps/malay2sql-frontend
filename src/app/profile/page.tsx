"use client"

import { useEffect, useState, useRef } from "react"
import { Moon, Sun, User, BarChart, Settings, LogOut, Trash2 } from "lucide-react"
import { useTheme } from "next-themes"
import { useUser } from "@/contexts/UserContext"
import api from "@/lib/axios"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function Component() {
  const { user, fetchUser } = useUser()
  const { setTheme, theme } = useTheme()
  const [activeTab, setActiveTab] = useState("profile")
  const router = useRouter()

  // Form state
  const [firstName, setFirstName] = useState(user?.first_name || "")
  const [lastName, setLastName] = useState(user?.last_name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isDeletingImage, setIsDeletingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update form when user data is loaded
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name)
      setLastName(user.last_name)
      setEmail(user.email)
    }
  }, [user])

  const handleBack = () => {
    router.push("/")
  }

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true)
    try {
      await api.put('/users/me', {
        first_name: firstName,
        last_name: lastName,
        email: email
      })
      await fetchUser() // Refresh user data
      setError("")
      toast.success("Profile updated successfully")
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile')
      toast.error(err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      toast.error("Passwords do not match")
      return
    }
    
    setIsUpdatingPassword(true)
    try {
      await api.put('/users/me', {
        password: newPassword
      })
      setNewPassword("")
      setConfirmPassword("")
      setError("")
      toast.success("Password updated successfully")
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update password')
      toast.error(err.response?.data?.detail || 'Failed to update password')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file")
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setIsUploadingImage(true)
    try {
      const response = await api.post('/users/me/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      await fetchUser() // Refresh user data to get new profile picture URL
      toast.success("Profile picture updated successfully")
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to upload profile picture')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleDeleteImage = async () => {
    if (!user?.profile_picture_url) return

    setIsDeletingImage(true)
    try {
      await api.delete('/users/me/profile-picture')
      await fetchUser() // Refresh user data
      toast.success("Profile picture deleted successfully")
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to delete profile picture')
    } finally {
      setIsDeletingImage(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-muted/40 p-6 lg:flex">
        <div className="flex items-center gap-2 pb-6">
          <User className="h-6 w-6" />
          <h1 className="text-lg font-semibold">MalaySQL</h1>
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          <Button
            variant={activeTab === "profile" ? "secondary" : "ghost"}
            className="justify-start"
            onClick={() => setActiveTab("profile")}
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
          <Button
            variant={activeTab === "statistics" ? "secondary" : "ghost"}
            className="justify-start"
            onClick={() => setActiveTab("statistics")}
          >
            <BarChart className="mr-2 h-4 w-4" />
            Statistics
          </Button>
        </nav>
        <div className="flex flex-col gap-4 pt-6">
          <Separator />
          <Button variant="outline" className="justify-start" onClick={handleBack}>
            <LogOut className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">User Profile</h2>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
        <Tabs value={activeTab} className="mt-6">
          <TabsList className="lg:hidden">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <div className="flex flex-col gap-4">
              <Card>
                  <CardHeader>
                    <CardTitle>User Information</CardTitle>
                    <CardDescription>Manage your profile information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage 
                          src={user?.profile_picture_url || "/placeholder.svg?height=80&width=80"} 
                          alt={`${user?.first_name}'s profile picture`} 
                        />
                        <AvatarFallback>
                          {user ? `${user.first_name[0]}${user.last_name[0]}` : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                        >
                          {isUploadingImage ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            'Change Picture'
                          )}
                        </Button>
                        {user?.profile_picture_url && (
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={handleDeleteImage}
                            disabled={isDeletingImage}
                          >
                            {isDeletingImage ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleUpdateProfile} 
                      disabled={isUpdatingProfile}
                    >
                      {isUpdatingProfile ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Password Settings</CardTitle>
                    <CardDescription>Manage your password</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input 
                        id="new-password" 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input 
                        id="confirm-password" 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleUpdatePassword}
                      disabled={isUpdatingPassword}
                    >
                      {isUpdatingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating Password...
                        </>
                      ) : (
                        'Change Password'
                      )}
                    </Button>
                  </CardContent>
                </Card>
                {error && (
                      <div className="text-red-500 text-sm">{error}</div>
                )}
            </div>
          </TabsContent>
          <TabsContent value="statistics">
            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
                <CardDescription>Your MalaySQL usage statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Total Queries Made</Label>
                  <p className="text-2xl font-bold">1,234</p>
                </div>
                <div className="grid gap-2">
                  <Label>Accuracy Rate</Label>
                  <p className="text-2xl font-bold">95.5%</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </main>
    </div>
  )
}