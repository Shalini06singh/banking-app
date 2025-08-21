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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getCurrentUser, updateCurrentUser, type User, type Transaction } from "@/lib/auth"
import { ArrowUpRight, ArrowDownLeft, Plus, Send, Search, Filter, Download, Calendar } from "lucide-react"

export default function TransactionsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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
      setTransactions(currentUser.transactions)
      setFilteredTransactions(currentUser.transactions)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!transactions) return

    let filtered = transactions

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.type === filterType)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((t) => t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Sort transactions
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, filterType, sortOrder])

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
      setTransactions(updatedUser.transactions)

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
      setTransactions(updatedUser.transactions)

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
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading transactions...</p>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
              <p className="text-muted-foreground">Manage your account transactions</p>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <Dialog open={isAddMoneyOpen} onOpenChange={setIsAddMoneyOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Money
                  </Button>
                </DialogTrigger>
                <DialogContent>
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
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    Transfer
                  </Button>
                </DialogTrigger>
                <DialogContent>
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
                      <p className="text-xs text-muted-foreground">
                        Available balance: ${user.balance.toLocaleString()}
                      </p>
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

          {/* Balance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Account Balance</CardTitle>
              <CardDescription>Current available balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${user.balance.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1)} Account
              </p>
            </CardContent>
          </Card>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View and manage your transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="debit">Debit</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Transactions List */}
              {filteredTransactions.length > 0 ? (
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.type === "credit" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          }`}
                        >
                          {transaction.type === "credit" ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()} at{" "}
                            {new Date(transaction.date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}${transaction.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Balance: ${transaction.balance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto mb-4 p-3 bg-muted rounded-full w-fit">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No transactions found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterType !== "all"
                      ? "Try adjusting your search or filters"
                      : "Start by adding money or making a transfer"}
                  </p>
                  {!searchTerm && filterType === "all" && (
                    <div className="flex justify-center space-x-2">
                      <Button onClick={() => setIsAddMoneyOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Money
                      </Button>
                      <Button variant="outline" onClick={() => setIsTransferOpen(true)}>
                        <Send className="h-4 w-4 mr-2" />
                        Transfer
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction Summary */}
          {transactions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                  <ArrowDownLeft className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    $
                    {transactions
                      .filter((t) => t.type === "credit")
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {transactions.filter((t) => t.type === "credit").length} transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    $
                    {transactions
                      .filter((t) => t.type === "debit")
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {transactions.filter((t) => t.type === "debit").length} transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Change</CardTitle>
                  <Badge variant="secondary">This Month</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    $
                    {transactions
                      .filter((t) => new Date(t.date).getMonth() === new Date().getMonth())
                      .reduce((sum, t) => sum + (t.type === "credit" ? t.amount : -t.amount), 0)
                      .toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {transactions.filter((t) => new Date(t.date).getMonth() === new Date().getMonth()).length}{" "}
                    transactions this month
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
