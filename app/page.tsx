"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  PiggyBank,
  TrendingUp,
  Shield,
  Smartphone,
  Clock,
  DollarSign,
  BarChart3,
  Wallet,
  Building2,
} from "lucide-react"

export default function BankingLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    const sessionCookie = document.cookie.split("; ").find((row) => row.startsWith("bankSession="))

    setIsAuthenticated(!!(currentUser && sessionCookie))
  }, [])

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      router.push("/auth/signup")
    }
  }

  const handleSignIn = () => {
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      router.push("/auth/signin")
    }
  }

  const features = [
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Digital Banking",
      description: "Manage your accounts, transfer money, and pay bills online with our secure platform.",
    },
    {
      icon: <PiggyBank className="h-8 w-8" />,
      title: "Savings & Deposits",
      description: "Grow your wealth with our competitive interest rates on savings, FD, and RD accounts.",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Investment Solutions",
      description: "Start your investment journey with SIP, mutual funds, and portfolio management.",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure Transactions",
      description: "Bank with confidence using our advanced security measures and fraud protection.",
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Mobile Banking",
      description: "Access your accounts anytime, anywhere with our user-friendly mobile app.",
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "24/7 Support",
      description: "Get help whenever you need it with our round-the-clock customer service.",
    },
  ]

  const services = [
    {
      icon: <Wallet className="h-6 w-6" />,
      title: "Personal Banking",
      description: "Savings, current accounts, and personal loans",
    },
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "Business Banking",
      description: "Corporate accounts and business financing solutions",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Investment Services",
      description: "SIP, mutual funds, and wealth management",
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Loans & Credit",
      description: "Personal, home, and business loans",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">SecureBank</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <a href="#home" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </a>
            <a href="#services" className="text-sm font-medium hover:text-primary transition-colors">
              Services
            </a>
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </a>
            <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </a>
            <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleSignIn}>
              {isAuthenticated ? "Dashboard" : "Sign In"}
            </Button>
            <Button size="sm" onClick={handleGetStarted}>
              {isAuthenticated ? "Dashboard" : "Get Started"}
            </Button>
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span
                className={`bg-foreground block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"}`}
              ></span>
              <span
                className={`bg-foreground block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? "opacity-0" : "opacity-100"}`}
              ></span>
              <span
                className={`bg-foreground block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5"}`}
              ></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="flex flex-col space-y-4 p-4">
              <a href="#home" className="text-sm font-medium hover:text-primary transition-colors">
                Home
              </a>
              <a href="#services" className="text-sm font-medium hover:text-primary transition-colors">
                Services
              </a>
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </a>
              <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">
                About
              </a>
              <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
                Contact
              </a>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={handleSignIn}>
                  {isAuthenticated ? "Dashboard" : "Sign In"}
                </Button>
                <Button size="sm" onClick={handleGetStarted}>
                  {isAuthenticated ? "Dashboard" : "Get Started"}
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative py-20 px-4 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient"></div>
        <div className="absolute inset-0 bg-pattern-dots opacity-30"></div>
        <div className="container mx-auto text-center relative z-10">
          <Badge variant="secondary" className="mb-4 bg-white/80 backdrop-blur-sm">
            Trusted by 1M+ customers
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Your Financial Future
            <span className="text-primary block">Starts Here</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience modern banking with secure transactions, smart investments, and personalized financial solutions
            designed for your success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 shadow-lg" onClick={handleGetStarted}>
              {isAuthenticated ? "Go to Dashboard" : "Open Account"}
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 bg-white/80 backdrop-blur-sm border-white/20">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative py-20 px-4 bg-gradient-section">
        <div className="absolute inset-0 bg-banking-pattern"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive banking solutions tailored to meet all your financial needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm border-white/20"
              >
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <div className="text-primary">{service.icon}</div>
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose SecureBank?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced features and security measures that make banking simple, safe, and convenient
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300 hover:scale-105 bg-card/80 backdrop-blur-sm"
              >
                <CardHeader>
                  <div className="mb-4 p-3 bg-accent/10 rounded-full w-fit">
                    <div className="text-accent">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-20"></div>
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Banking Journey?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join millions of satisfied customers who trust SecureBank for their financial needs. Open your account today
            and experience the future of banking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 shadow-lg" onClick={handleGetStarted}>
              {isAuthenticated ? "Go to Dashboard" : "Open Account Now"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-white/10 backdrop-blur-sm"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 bg-muted">
        <div className="absolute inset-0 bg-pattern-dots opacity-20"></div>
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-primary">SecureBank</span>
              </div>
              <p className="text-muted-foreground">
                Your trusted partner for all financial needs. Banking made simple, secure, and accessible.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Personal Banking
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Business Banking
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Investments
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Loans
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 SecureBank. All rights reserved. | Licensed by Banking Authority</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
