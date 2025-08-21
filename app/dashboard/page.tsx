"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getCurrentUser, updateCurrentUser, type User, type Transaction } from "@/lib/auth"
import {
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Wallet,
  Plus,
  Send,
  Download,
  BarChart3,
} from "lucide-react"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [showBalance, setShowBalance] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const router = useRouter()

  // Add Money Form State
  const [addAmount, setAddAmount] = useState("")
  const [addDescription, setAddDescription] = useState("")
  const [addError, setAddError] = useState("")
  const [isAddingMoney, setIsAddingMoney] = useState(false)

  // Transfer Money Form State
  const [transferAmount, setTransferAmount] = useState("")
  const [transferTo, setTransferTo] = useState("")
  const [transferDescription, setTransferDescription] = useState("")
  const [transferError, setTransferError] = useState("")
  const [isTransferring, setIsTransferring] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
    setIsLoading(false)
  }, [])

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingMoney(true)
    setAddError("")

    try {
      const amount = Number.parseFloat(addAmount)
      if (isNaN(amount) || amount <= 0) {
        setAddError("Please enter a valid amount")
        return
      }

      if (!user) return

      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: "credit",
        amount,
        description: addDescription || "Money Added",
        date: new Date().toISOString(),
        balance: user.balance + amount,
      }

      const updatedUser = {
        ...user,
        balance: user.balance + amount,
        transactions: [...user.transactions, newTransaction],
      }

      updateCurrentUser(updatedUser)
      setUser(updatedUser)

      // Reset form
      setAddAmount("")
      setAddDescription("")
      setIsAddMoneyOpen(false)
    } catch (err) {
      setAddError("An error occurred while adding money")
    } finally {
      setIsAddingMoney(false)
    }
  }

  const handleTransferMoney = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsTransferring(true)
    setTransferError("")

    try {
      const amount = Number.parseFloat(transferAmount)
      if (isNaN(amount) || amount <= 0) {
        setTransferError("Please enter a valid amount")
        return
      }

      if (!user) return

      if (amount > user.balance) {
        setTransferError("Insufficient balance")
        return
      }

      if (!transferTo.trim()) {
        setTransferError("Please enter recipient details")
        return
      }

      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: "debit",
        amount,
        description: transferDescription || `Transfer to ${transferTo}`,
        date: new Date().toISOString(),
        balance: user.balance - amount,
      }

      const updatedUser = {
        ...user,
        balance: user.balance - amount,
        transactions: [...user.transactions, newTransaction],
      }

      updateCurrentUser(updatedUser)
      setUser(updatedUser)

      // Reset form
      setTransferAmount("")
      setTransferTo("")
      setTransferDescription("")
      setIsTransferOpen(false)
    } catch (err) {
      setTransferError("An error occurred while transferring money")
    } finally {
      setIsTransferring(false)
    }
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!user) {
    return null
  }

  const recentTransactions = user.transactions.slice(-5).reverse()
  const totalInvestments =
    user.investments.sip.reduce((sum, sip) => sum + sip.currentValue, 0) +
    user.investments.fd.reduce((sum, fd) => sum + fd.amount, 0) +
    user.investments.rd.reduce((sum, rd) => sum + rd.currentValue, 0)

  const quickActions = [
    {
      icon: <Send className="h-5 w-5" />,
      title: "Transfer Money",
      description: "Send money to other accounts",
      action: () => setIsTransferOpen(true),
    },
    {
      icon: <Plus className="h-5 w-5" />,
      title: "Add Money",
      description: "Deposit funds to your account",
      action: () => setIsAddMoneyOpen(true),
    },
    {
      icon: <Download className="h-5 w-5" />,
      title: "Pay Bills",
      description: "Pay utilities and services",
      action: () => console.log("Pay bills"),
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: "Request Card",
      description: "Apply for debit/credit card",
      action: () => console.log("Request card"),
    },
  ]

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-dashboard">
          <div className="absolute inset-0 bg-banking-pattern opacity-30"></div>
          <div className="relative z-10 space-y-6 p-6">
            {/* Welcome Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Welcome back, {user.firstName}!</h1>
                <p className="text-muted-foreground">Here's what's happening with your account today.</p>
              </div>
              <Badge variant="secondary" className="w-fit bg-white/80 backdrop-blur-sm">
                Account: {user.accountNumber}
              </Badge>
            </div>

            {/* Account Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="col-span-1 md:col-span-2 bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowBalance(!showBalance)}>
                    {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {showBalance ? `$${user.balance.toLocaleString()}` : "••••••"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1)} Account
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalInvestments.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+12.5% from last month</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    $
                    {user.transactions
                      .filter((t) => new Date(t.date).getMonth() === new Date().getMonth())
                      .reduce((sum, t) => sum + (t.type === "credit" ? t.amount : -t.amount), 0)
                      .toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Net transactions</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used banking operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center space-y-2 bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 transition-all duration-300 hover:scale-105"
                      onClick={action.action}
                    >
                      <div className="p-2 bg-primary/10 rounded-full">
                        <div className="text-primary">{action.icon}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-sm">{action.title}</div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions & Investment Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your latest account activity</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/dashboard/transactions")}
                    className="bg-white/60 backdrop-blur-sm"
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  {recentTransactions.length > 0 ? (
                    <div className="space-y-4">
                      {recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-full ${
                                transaction.type === "credit"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {transaction.type === "credit" ? (
                                <ArrowDownLeft className="h-4 w-4" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`font-medium ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
                          >
                            {transaction.type === "credit" ? "+" : "-"}${transaction.amount.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No transactions yet</p>
                      <p className="text-sm text-muted-foreground mb-4">Your transaction history will appear here</p>
                      <div className="flex justify-center space-x-2">
                        <Button size="sm" onClick={() => setIsAddMoneyOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Money
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsTransferOpen(true)}>
                          <Send className="h-4 w-4 mr-2" />
                          Transfer
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Investment Overview */}
              <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Investment Portfolio</CardTitle>
                    <CardDescription>Your investment breakdown</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="bg-white/60 backdrop-blur-sm">
                    Manage
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* SIP Investments */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">SIP Investments</p>
                          <p className="text-xs text-muted-foreground">{user.investments.sip.length} active plans</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${user.investments.sip.reduce((sum, sip) => sum + sip.currentValue, 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-green-600">+8.2%</p>
                      </div>
                    </div>

                    {/* Fixed Deposits */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 text-green-600 rounded-full">
                          <PiggyBank className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Fixed Deposits</p>
                          <p className="text-xs text-muted-foreground">{user.investments.fd.length} deposits</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${user.investments.fd.reduce((sum, fd) => sum + fd.amount, 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-blue-600">6.5% p.a.</p>
                      </div>
                    </div>

                    {/* Recurring Deposits */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-full">
                          <Wallet className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Recurring Deposits</p>
                          <p className="text-xs text-muted-foreground">{user.investments.rd.length} active RDs</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${user.investments.rd.reduce((sum, rd) => sum + rd.currentValue, 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-blue-600">5.8% p.a.</p>
                      </div>
                    </div>

                    {totalInvestments === 0 && (
                      <div className="text-center py-4">
                        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No investments yet</p>
                        <p className="text-sm text-muted-foreground mb-4">Start investing to grow your wealth</p>
                        <Button size="sm">Start Investing</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Account Details */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your account details and settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Account Holder</Label>
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Account Number</Label>
                    <p className="font-medium">{user.accountNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Account Type</Label>
                    <p className="font-medium capitalize">{user.accountType}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                    <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Modals */}
            <Dialog open={isAddMoneyOpen} onOpenChange={setIsAddMoneyOpen}>
              <DialogContent className="bg-white/95 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle>Add Money</DialogTitle>
                  <DialogDescription>Add funds to your account</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddMoney} className="space-y-4">
                  {addError && (
                    <Alert variant="destructive">
                      <AlertDescription>{addError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="addAmount">Amount</Label>
                    <Input
                      id="addAmount"
                      type="number"
                      placeholder="Enter amount"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      required
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addDescription">Description (Optional)</Label>
                    <Input
                      id="addDescription"
                      placeholder="Enter description"
                      value={addDescription}
                      onChange={(e) => setAddDescription(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isAddingMoney}>
                    {isAddingMoney ? "Adding Money..." : "Add Money"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
              <DialogContent className="bg-white/95 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle>Transfer Money</DialogTitle>
                  <DialogDescription>Send money to another account</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleTransferMoney} className="space-y-4">
                  {transferError && (
                    <Alert variant="destructive">
                      <AlertDescription>{transferError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="transferAmount">Amount</Label>
                    <Input
                      id="transferAmount"
                      type="number"
                      placeholder="Enter amount"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      required
                      min="0.01"
                      step="0.01"
                    />
                    <p className="text-xs text-muted-foreground">Available balance: ${user.balance.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transferTo">Transfer To</Label>
                    <Input
                      id="transferTo"
                      placeholder="Account number or email"
                      value={transferTo}
                      onChange={(e) => setTransferTo(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transferDescription">Description (Optional)</Label>
                    <Input
                      id="transferDescription"
                      placeholder="Enter description"
                      value={transferDescription}
                      onChange={(e) => setTransferDescription(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isTransferring}>
                    {isTransferring ? "Transferring..." : "Transfer Money"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
