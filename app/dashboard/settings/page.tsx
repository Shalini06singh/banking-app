"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { getCurrentUser, updateCurrentUser, DataPersistence, SessionManager, logout, type User } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { UserIcon, Download, Upload, Trash2, Shield, Database, AlertTriangle, CheckCircle, Info } from "lucide-react"

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [storageStats, setStorageStats] = useState<any>(null)
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const router = useRouter()

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setProfileForm({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phone,
      })
    }

    // Get storage stats
    const stats = DataPersistence.getStorageStats()
    setStorageStats(stats)

    // Get session info
    const session = SessionManager.getSessionInfo()
    setSessionInfo(session)

    setIsLoading(false)
  }, [])

  const showMessage = (type: "success" | "error" | "info", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProfile(true)

    try {
      if (!user) return

      const updatedUser = {
        ...user,
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
        phone: profileForm.phone,
      }

      const success = updateCurrentUser(updatedUser)
      if (success) {
        setUser(updatedUser)
        showMessage("success", "Profile updated successfully")
      } else {
        showMessage("error", "Failed to update profile")
      }
    } catch (error) {
      showMessage("error", "An error occurred while updating profile")
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleExportData = () => {
    try {
      const backupData = DataPersistence.exportUserData()
      if (!backupData) {
        showMessage("error", "Failed to export data")
        return
      }

      const blob = new Blob([backupData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `securebank-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showMessage("success", "Data exported successfully")
    } catch (error) {
      showMessage("error", "Failed to export data")
    }
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const backupData = e.target?.result as string
        const success = DataPersistence.importUserData(backupData)

        if (success) {
          showMessage("success", "Data imported successfully. Please refresh the page.")
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        } else {
          showMessage("error", "Failed to import data. Please check the file format.")
        }
      } catch (error) {
        showMessage("error", "Invalid backup file")
      }
    }
    reader.readAsText(file)
  }

  const handleClearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      const success = DataPersistence.clearAllData()
      if (success) {
        showMessage("success", "All data cleared successfully. Redirecting to home page...")
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        showMessage("error", "Failed to clear data")
      }
    }
  }

  const handleLogout = () => {
    const success = logout()
    if (success) {
      router.push("/")
    } else {
      showMessage("error", "Failed to logout")
    }
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading settings...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (!user) {
    return null
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          {/* Messages */}
          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"}>
              {message.type === "success" && <CheckCircle className="h-4 w-4" />}
              {message.type === "error" && <AlertTriangle className="h-4 w-4" />}
              {message.type === "info" && <Info className="h-4 w-4" />}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details (read-only)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Account Number</Label>
                  <p className="font-medium">{user.accountNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Account Type</Label>
                  <p className="font-medium capitalize">{user.accountType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                  <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Current Balance</Label>
                  <p className="font-medium">${user.balance.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Data Management</span>
              </CardTitle>
              <CardDescription>Backup, restore, and manage your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Storage Statistics */}
              {storageStats && (
                <div>
                  <h3 className="font-medium mb-3">Storage Usage</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="font-bold">{storageStats.userCount}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Current User Data</p>
                      <p className="font-bold">{storageStats.currentUserSize} KB</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">All Users Data</p>
                      <p className="font-bold">{storageStats.allUsersSize} KB</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Storage</p>
                      <p className="font-bold">{storageStats.totalSize} KB</p>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Data Operations */}
              <div className="space-y-4">
                <h3 className="font-medium">Data Operations</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={handleExportData} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <div>
                    <input type="file" accept=".json" onChange={handleImportData} className="hidden" id="import-file" />
                    <Button asChild variant="outline">
                      <label htmlFor="import-file" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Import Data
                      </label>
                    </Button>
                  </div>
                  <Button onClick={handleClearAllData} variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Session Information</span>
              </CardTitle>
              <CardDescription>Current session details and security</CardDescription>
            </CardHeader>
            <CardContent>
              {sessionInfo && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Session Status</span>
                    <Badge variant={sessionInfo.isValid ? "default" : "destructive"}>
                      {sessionInfo.isValid ? "Valid" : "Invalid"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">User ID</span>
                    <span className="font-mono text-sm">{sessionInfo.userId}</span>
                  </div>
                  <Separator />
                  <Button onClick={handleLogout} variant="outline" className="w-full bg-transparent">
                    Sign Out
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
