"use client"

import { useState } from "react"
import { Moon, Sun, User, BarChart, Settings, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation";

export default function Component() {
  const { setTheme, theme } = useTheme()
  const [activeTab, setActiveTab] = useState("profile")
  const router = useRouter();
  const handleBack = () => {
    // Add your logout logic here
    router.push("/");
  };

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
          <Button
            variant={activeTab === "settings" ? "secondary" : "ghost"}
            className="justify-start"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
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
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>Manage your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" alt="User's profile picture" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Button>Change Picture</Button>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value="John Doe" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value="john.doe@example.com" />
                </div>
              </CardContent>
            </Card>
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
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button>Change Password</Button>
                <Separator />
                <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Email Notifications</Label>
                    <Switch id="notifications" />
                </div>
                </CardContent>
            </Card>
            </TabsContent>
        </Tabs>
        </main>
    </div>
  )
}