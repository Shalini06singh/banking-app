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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  getCurrentUser,
  updateCurrentUser,
  type User,
  type SIPInvestment,
  type FDInvestment,
  type RDInvestment,
  type Transaction,
} from "@/lib/auth"
import { TrendingUp, PiggyBank, Wallet, Plus, Target } from "lucide-react"

export default function InvestmentsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // SIP Modal State
  const [isSIPOpen, setIsSIPOpen] = useState(false)
  const [sipForm, setSipForm] = useState({
    fundName: "",
    monthlyAmount: "",
    duration: "",
  })
  const [sipError, setSipError] = useState("")
  const [isCreatingSIP, setIsCreatingSIP] = useState(false)

  // FD Modal State
  const [isFDOpen, setIsFDOpen] = useState(false)
  const [fdForm, setFdForm] = useState({
    amount: "",
    tenure: "",
    interestRate: "6.5",
  })
  const [fdError, setFdError] = useState("")
  const [isCreatingFD, setIsCreatingFD] = useState(false)

  // RD Modal State
  const [isRDOpen, setIsRDOpen] = useState(false)
  const [rdForm, setRdForm] = useState({
    monthlyAmount: "",
    tenure: "",
    interestRate: "5.8",
  })
  const [rdError, setRdError] = useState("")
  const [isCreatingRD, setIsCreatingRD] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
    setIsLoading(false)
  }, [])

  const handleCreateSIP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingSIP(true)
    setSipError("")

    try {
      const monthlyAmount = Number.parseFloat(sipForm.monthlyAmount)
      const duration = Number.parseInt(sipForm.duration)

      if (isNaN(monthlyAmount) || monthlyAmount <= 0) {
        setSipError("Please enter a valid monthly amount")
        return
      }

      if (isNaN(duration) || duration <= 0) {
        setSipError("Please enter a valid duration")
        return
      }

      if (!sipForm.fundName.trim()) {
        setSipError("Please select a fund")
        return
      }

      if (!user) return

      if (monthlyAmount > user.balance) {
        setSipError("Insufficient balance for first installment")
        return
      }

      const newSIP: SIPInvestment = {
        id: Date.now().toString(),
        fundName: sipForm.fundName,
        monthlyAmount,
        startDate: new Date().toISOString(),
        duration,
        currentValue: monthlyAmount, // First installment
      }

      const newTransaction: Transaction = {
        id: (Date.now() + 1).toString(),
        type: "debit",
        amount: monthlyAmount,
        description: `SIP Investment - ${sipForm.fundName}`,
        date: new Date().toISOString(),
        balance: user.balance - monthlyAmount,
      }

      const updatedUser = {
        ...user,
        balance: user.balance - monthlyAmount,
        investments: {
          ...user.investments,
          sip: [...user.investments.sip, newSIP],
        },
        transactions: [...user.transactions, newTransaction],
      }

      updateCurrentUser(updatedUser)
      setUser(updatedUser)

      // Reset form
      setSipForm({ fundName: "", monthlyAmount: "", duration: "" })
      setIsSIPOpen(false)
    } catch (err) {
      setSipError("An error occurred while creating SIP")
    } finally {
      setIsCreatingSIP(false)
    }
  }

  const handleCreateFD = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingFD(true)
    setFdError("")

    try {
      const amount = Number.parseFloat(fdForm.amount)
      const tenure = Number.parseInt(fdForm.tenure)
      const interestRate = Number.parseFloat(fdForm.interestRate)

      if (isNaN(amount) || amount <= 0) {
        setFdError("Please enter a valid amount")
        return
      }

      if (isNaN(tenure) || tenure <= 0) {
        setFdError("Please enter a valid tenure")
        return
      }

      if (!user) return

      if (amount > user.balance) {
        setFdError("Insufficient balance")
        return
      }

      const startDate = new Date()
      const maturityDate = new Date(startDate)
      maturityDate.setFullYear(maturityDate.getFullYear() + tenure)

      const maturityAmount = amount * Math.pow(1 + interestRate / 100, tenure)

      const newFD: FDInvestment = {
        id: Date.now().toString(),
        amount,
        interestRate,
        tenure,
        startDate: startDate.toISOString(),
        maturityDate: maturityDate.toISOString(),
        maturityAmount,
      }

      const newTransaction: Transaction = {
        id: (Date.now() + 1).toString(),
        type: "debit",
        amount,
        description: `Fixed Deposit - ${tenure} year(s)`,
        date: new Date().toISOString(),
        balance: user.balance - amount,
      }

      const updatedUser = {
        ...user,
        balance: user.balance - amount,
        investments: {
          ...user.investments,
          fd: [...user.investments.fd, newFD],
        },
        transactions: [...user.transactions, newTransaction],
      }

      updateCurrentUser(updatedUser)
      setUser(updatedUser)

      // Reset form
      setFdForm({ amount: "", tenure: "", interestRate: "6.5" })
      setIsFDOpen(false)
    } catch (err) {
      setFdError("An error occurred while creating Fixed Deposit")
    } finally {
      setIsCreatingFD(false)
    }
  }

  const handleCreateRD = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingRD(true)
    setRdError("")

    try {
      const monthlyAmount = Number.parseFloat(rdForm.monthlyAmount)
      const tenure = Number.parseInt(rdForm.tenure)
      const interestRate = Number.parseFloat(rdForm.interestRate)

      if (isNaN(monthlyAmount) || monthlyAmount <= 0) {
        setRdError("Please enter a valid monthly amount")
        return
      }

      if (isNaN(tenure) || tenure <= 0) {
        setRdError("Please enter a valid tenure")
        return
      }

      if (!user) return

      if (monthlyAmount > user.balance) {
        setRdError("Insufficient balance for first installment")
        return
      }

      const startDate = new Date()
      const maturityDate = new Date(startDate)
      maturityDate.setFullYear(maturityDate.getFullYear() + tenure)

      const newRD: RDInvestment = {
        id: Date.now().toString(),
        monthlyAmount,
        interestRate,
        tenure,
        startDate: startDate.toISOString(),
        maturityDate: maturityDate.toISOString(),
        currentValue: monthlyAmount, // First installment
      }

      const newTransaction: Transaction = {
        id: (Date.now() + 1).toString(),
        type: "debit",
        amount: monthlyAmount,
        description: `Recurring Deposit - ${tenure} year(s)`,
        date: new Date().toISOString(),
        balance: user.balance - monthlyAmount,
      }

      const updatedUser = {
        ...user,
        balance: user.balance - monthlyAmount,
        investments: {
          ...user.investments,
          rd: [...user.investments.rd, newRD],
        },
        transactions: [...user.transactions, newTransaction],
      }

      updateCurrentUser(updatedUser)
      setUser(updatedUser)

      // Reset form
      setRdForm({ monthlyAmount: "", tenure: "", interestRate: "5.8" })
      setIsRDOpen(false)
    } catch (err) {
      setRdError("An error occurred while creating Recurring Deposit")
    } finally {
      setIsCreatingRD(false)
    }
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading investments...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (!user) {
    return null
  }

  const totalSIPValue = user.investments.sip.reduce((sum, sip) => sum + sip.currentValue, 0)
  const totalFDValue = user.investments.fd.reduce((sum, fd) => sum + fd.amount, 0)
  const totalRDValue = user.investments.rd.reduce((sum, rd) => sum + rd.currentValue, 0)
  const totalInvestments = totalSIPValue + totalFDValue + totalRDValue

  const mutualFunds = [
    "HDFC Top 100 Fund",
    "ICICI Prudential Bluechip Fund",
    "SBI Large Cap Fund",
    "Axis Bluechip Fund",
    "Kotak Select Focus Fund",
    "Mirae Asset Large Cap Fund",
    "Nippon India Large Cap Fund",
    "UTI Mastershare Fund",
  ]

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Investments</h1>
              <p className="text-muted-foreground">Grow your wealth with smart investment options</p>
            </div>
            <Badge variant="secondary" className="w-fit">
              Total Portfolio: ${totalInvestments.toLocaleString()}
            </Badge>
          </div>

          {/* Investment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalInvestments.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12.5% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SIP Investments</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalSIPValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{user.investments.sip.length} active plans</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fixed Deposits</CardTitle>
                <PiggyBank className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalFDValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{user.investments.fd.length} deposits</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recurring Deposits</CardTitle>
                <Wallet className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRDValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{user.investments.rd.length} active RDs</p>
              </CardContent>
            </Card>
          </div>

          {/* Investment Tabs */}
          <Tabs defaultValue="sip" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sip">SIP Investments</TabsTrigger>
              <TabsTrigger value="fd">Fixed Deposits</TabsTrigger>
              <TabsTrigger value="rd">Recurring Deposits</TabsTrigger>
            </TabsList>

            {/* SIP Tab */}
            <TabsContent value="sip" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Systematic Investment Plans (SIP)</CardTitle>
                    <CardDescription>Invest regularly in mutual funds</CardDescription>
                  </div>
                  <Dialog open={isSIPOpen} onOpenChange={setIsSIPOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Start SIP
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Start SIP Investment</DialogTitle>
                        <DialogDescription>Begin your systematic investment plan</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateSIP} className="space-y-4">
                        {sipError && (
                          <Alert variant="destructive">
                            <AlertDescription>{sipError}</AlertDescription>
                          </Alert>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="fundName">Mutual Fund</Label>
                          <Select onValueChange={(value) => setSipForm({ ...sipForm, fundName: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a mutual fund" />
                            </SelectTrigger>
                            <SelectContent>
                              {mutualFunds.map((fund) => (
                                <SelectItem key={fund} value={fund}>
                                  {fund}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="monthlyAmount">Monthly Investment Amount</Label>
                          <Input
                            id="monthlyAmount"
                            type="number"
                            placeholder="Enter monthly amount"
                            value={sipForm.monthlyAmount}
                            onChange={(e) => setSipForm({ ...sipForm, monthlyAmount: e.target.value })}
                            required
                            min="500"
                            step="100"
                          />
                          <p className="text-xs text-muted-foreground">
                            Minimum: $500 | Available balance: ${user.balance.toLocaleString()}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="duration">Investment Duration (Years)</Label>
                          <Select onValueChange={(value) => setSipForm({ ...sipForm, duration: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Year</SelectItem>
                              <SelectItem value="2">2 Years</SelectItem>
                              <SelectItem value="3">3 Years</SelectItem>
                              <SelectItem value="5">5 Years</SelectItem>
                              <SelectItem value="10">10 Years</SelectItem>
                              <SelectItem value="15">15 Years</SelectItem>
                              <SelectItem value="20">20 Years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" className="w-full" disabled={isCreatingSIP}>
                          {isCreatingSIP ? "Starting SIP..." : "Start SIP Investment"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {user.investments.sip.length > 0 ? (
                    <div className="space-y-4">
                      {user.investments.sip.map((sip) => (
                        <div key={sip.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{sip.fundName}</h3>
                            <Badge variant="secondary">Active</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Monthly Amount</p>
                              <p className="font-medium">${sip.monthlyAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Duration</p>
                              <p className="font-medium">{sip.duration} years</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Current Value</p>
                              <p className="font-medium text-green-600">${sip.currentValue.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Started</p>
                              <p className="font-medium">{new Date(sip.startDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No SIP Investments</h3>
                      <p className="text-muted-foreground mb-4">Start your first SIP to build wealth systematically</p>
                      <Button onClick={() => setIsSIPOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Start Your First SIP
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* FD Tab */}
            <TabsContent value="fd" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Fixed Deposits</CardTitle>
                    <CardDescription>Secure investments with guaranteed returns</CardDescription>
                  </div>
                  <Dialog open={isFDOpen} onOpenChange={setIsFDOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create FD
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Fixed Deposit</DialogTitle>
                        <DialogDescription>Invest in a secure fixed deposit</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateFD} className="space-y-4">
                        {fdError && (
                          <Alert variant="destructive">
                            <AlertDescription>{fdError}</AlertDescription>
                          </Alert>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="fdAmount">Investment Amount</Label>
                          <Input
                            id="fdAmount"
                            type="number"
                            placeholder="Enter amount"
                            value={fdForm.amount}
                            onChange={(e) => setFdForm({ ...fdForm, amount: e.target.value })}
                            required
                            min="1000"
                            step="100"
                          />
                          <p className="text-xs text-muted-foreground">
                            Minimum: $1,000 | Available balance: ${user.balance.toLocaleString()}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fdTenure">Tenure (Years)</Label>
                          <Select onValueChange={(value) => setFdForm({ ...fdForm, tenure: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select tenure" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Year (6.0% p.a.)</SelectItem>
                              <SelectItem value="2">2 Years (6.25% p.a.)</SelectItem>
                              <SelectItem value="3">3 Years (6.5% p.a.)</SelectItem>
                              <SelectItem value="5">5 Years (6.75% p.a.)</SelectItem>
                              <SelectItem value="10">10 Years (7.0% p.a.)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fdInterestRate">Interest Rate (% p.a.)</Label>
                          <Input
                            id="fdInterestRate"
                            type="number"
                            value={fdForm.interestRate}
                            onChange={(e) => setFdForm({ ...fdForm, interestRate: e.target.value })}
                            step="0.1"
                            min="5"
                            max="10"
                            readOnly
                          />
                        </div>
                        {fdForm.amount && fdForm.tenure && (
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Maturity Amount</p>
                            <p className="text-lg font-bold">
                              $
                              {(
                                Number.parseFloat(fdForm.amount || "0") *
                                Math.pow(
                                  1 + Number.parseFloat(fdForm.interestRate) / 100,
                                  Number.parseInt(fdForm.tenure || "1"),
                                )
                              ).toLocaleString()}
                            </p>
                          </div>
                        )}
                        <Button type="submit" className="w-full" disabled={isCreatingFD}>
                          {isCreatingFD ? "Creating FD..." : "Create Fixed Deposit"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {user.investments.fd.length > 0 ? (
                    <div className="space-y-4">
                      {user.investments.fd.map((fd) => (
                        <div key={fd.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">Fixed Deposit #{fd.id.slice(-4)}</h3>
                            <Badge variant="secondary">Active</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Principal Amount</p>
                              <p className="font-medium">${fd.amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Interest Rate</p>
                              <p className="font-medium">{fd.interestRate}% p.a.</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Maturity Amount</p>
                              <p className="font-medium text-green-600">${fd.maturityAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Maturity Date</p>
                              <p className="font-medium">{new Date(fd.maturityDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Fixed Deposits</h3>
                      <p className="text-muted-foreground mb-4">Create your first FD for guaranteed returns</p>
                      <Button onClick={() => setIsFDOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First FD
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* RD Tab */}
            <TabsContent value="rd" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recurring Deposits</CardTitle>
                    <CardDescription>Save regularly with attractive interest rates</CardDescription>
                  </div>
                  <Dialog open={isRDOpen} onOpenChange={setIsRDOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Start RD
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Start Recurring Deposit</DialogTitle>
                        <DialogDescription>Begin your recurring deposit plan</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateRD} className="space-y-4">
                        {rdError && (
                          <Alert variant="destructive">
                            <AlertDescription>{rdError}</AlertDescription>
                          </Alert>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="rdMonthlyAmount">Monthly Deposit Amount</Label>
                          <Input
                            id="rdMonthlyAmount"
                            type="number"
                            placeholder="Enter monthly amount"
                            value={rdForm.monthlyAmount}
                            onChange={(e) => setRdForm({ ...rdForm, monthlyAmount: e.target.value })}
                            required
                            min="100"
                            step="50"
                          />
                          <p className="text-xs text-muted-foreground">
                            Minimum: $100 | Available balance: ${user.balance.toLocaleString()}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rdTenure">Tenure (Years)</Label>
                          <Select onValueChange={(value) => setRdForm({ ...rdForm, tenure: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select tenure" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Year (5.5% p.a.)</SelectItem>
                              <SelectItem value="2">2 Years (5.75% p.a.)</SelectItem>
                              <SelectItem value="3">3 Years (5.8% p.a.)</SelectItem>
                              <SelectItem value="5">5 Years (6.0% p.a.)</SelectItem>
                              <SelectItem value="10">10 Years (6.25% p.a.)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rdInterestRate">Interest Rate (% p.a.)</Label>
                          <Input
                            id="rdInterestRate"
                            type="number"
                            value={rdForm.interestRate}
                            onChange={(e) => setRdForm({ ...rdForm, interestRate: e.target.value })}
                            step="0.1"
                            min="5"
                            max="7"
                            readOnly
                          />
                        </div>
                        {rdForm.monthlyAmount && rdForm.tenure && (
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Estimated Maturity Amount</p>
                            <p className="text-lg font-bold">
                              $
                              {(
                                Number.parseFloat(rdForm.monthlyAmount || "0") *
                                12 *
                                Number.parseInt(rdForm.tenure || "1") *
                                (1 + Number.parseFloat(rdForm.interestRate) / 100)
                              ).toLocaleString()}
                            </p>
                          </div>
                        )}
                        <Button type="submit" className="w-full" disabled={isCreatingRD}>
                          {isCreatingRD ? "Starting RD..." : "Start Recurring Deposit"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {user.investments.rd.length > 0 ? (
                    <div className="space-y-4">
                      {user.investments.rd.map((rd) => (
                        <div key={rd.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">Recurring Deposit #{rd.id.slice(-4)}</h3>
                            <Badge variant="secondary">Active</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Monthly Amount</p>
                              <p className="font-medium">${rd.monthlyAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Interest Rate</p>
                              <p className="font-medium">{rd.interestRate}% p.a.</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Current Value</p>
                              <p className="font-medium text-green-600">${rd.currentValue.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Maturity Date</p>
                              <p className="font-medium">{new Date(rd.maturityDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Recurring Deposits</h3>
                      <p className="text-muted-foreground mb-4">Start your first RD to save regularly</p>
                      <Button onClick={() => setIsRDOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Start Your First RD
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
