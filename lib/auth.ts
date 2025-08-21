export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  accountType: string
  accountNumber: string
  balance: number
  createdAt: string
  transactions: Transaction[]
  investments: {
    sip: SIPInvestment[]
    fd: FDInvestment[]
    rd: RDInvestment[]
  }
}

export interface Transaction {
  id: string
  type: "credit" | "debit"
  amount: number
  description: string
  date: string
  balance: number
}

export interface SIPInvestment {
  id: string
  fundName: string
  monthlyAmount: number
  startDate: string
  duration: number
  currentValue: number
}

export interface FDInvestment {
  id: string
  amount: number
  interestRate: number
  tenure: number
  startDate: string
  maturityDate: string
  maturityAmount: number
}

export interface RDInvestment {
  id: string
  monthlyAmount: number
  interestRate: number
  tenure: number
  startDate: string
  maturityDate: string
  currentValue: number
}

export const DataPersistence = {
  // Safe localStorage operations with error handling
  safeGetItem: (key: string): string | null => {
    try {
      if (typeof window === "undefined") return null
      return localStorage.getItem(key)
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error)
      return null
    }
  },

  safeSetItem: (key: string, value: string): boolean => {
    try {
      if (typeof window === "undefined") return false
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error)
      return false
    }
  },

  safeRemoveItem: (key: string): boolean => {
    try {
      if (typeof window === "undefined") return false
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error)
      return false
    }
  },

  // Data validation
  validateUser: (user: any): user is User => {
    return (
      user &&
      typeof user.id === "string" &&
      typeof user.firstName === "string" &&
      typeof user.lastName === "string" &&
      typeof user.email === "string" &&
      typeof user.phone === "string" &&
      typeof user.dateOfBirth === "string" &&
      typeof user.accountType === "string" &&
      typeof user.accountNumber === "string" &&
      typeof user.balance === "number" &&
      typeof user.createdAt === "string" &&
      Array.isArray(user.transactions) &&
      user.investments &&
      Array.isArray(user.investments.sip) &&
      Array.isArray(user.investments.fd) &&
      Array.isArray(user.investments.rd)
    )
  },

  // Backup all user data
  exportUserData: (): string | null => {
    try {
      const currentUser = DataPersistence.safeGetItem("currentUser")
      const allUsers = DataPersistence.safeGetItem("bankUsers")

      if (!currentUser || !allUsers) return null

      const backupData = {
        currentUser: JSON.parse(currentUser),
        allUsers: JSON.parse(allUsers),
        timestamp: new Date().toISOString(),
        version: "1.0",
      }

      return JSON.stringify(backupData, null, 2)
    } catch (error) {
      console.error("Error exporting user data:", error)
      return null
    }
  },

  // Restore user data from backup
  importUserData: (backupData: string): boolean => {
    try {
      const data = JSON.parse(backupData)

      if (!data.currentUser || !data.allUsers) {
        throw new Error("Invalid backup data format")
      }

      // Validate current user
      if (!DataPersistence.validateUser(data.currentUser)) {
        throw new Error("Invalid current user data")
      }

      // Validate all users
      if (!Array.isArray(data.allUsers) || !data.allUsers.every(DataPersistence.validateUser)) {
        throw new Error("Invalid users array data")
      }

      // Import data
      const success1 = DataPersistence.safeSetItem("currentUser", JSON.stringify(data.currentUser))
      const success2 = DataPersistence.safeSetItem("bankUsers", JSON.stringify(data.allUsers))

      return success1 && success2
    } catch (error) {
      console.error("Error importing user data:", error)
      return false
    }
  },

  // Clear all application data
  clearAllData: (): boolean => {
    try {
      const success1 = DataPersistence.safeRemoveItem("currentUser")
      const success2 = DataPersistence.safeRemoveItem("bankUsers")

      // Clear session cookie
      if (typeof document !== "undefined") {
        document.cookie = "bankSession=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
      }

      return success1 && success2
    } catch (error) {
      console.error("Error clearing application data:", error)
      return false
    }
  },

  // Get storage usage statistics
  getStorageStats: () => {
    try {
      if (typeof window === "undefined") return null

      const currentUser = DataPersistence.safeGetItem("currentUser")
      const allUsers = DataPersistence.safeGetItem("bankUsers")

      const currentUserSize = currentUser ? new Blob([currentUser]).size : 0
      const allUsersSize = allUsers ? new Blob([allUsers]).size : 0
      const totalSize = currentUserSize + allUsersSize

      return {
        currentUserSize: Math.round((currentUserSize / 1024) * 100) / 100, // KB
        allUsersSize: Math.round((allUsersSize / 1024) * 100) / 100, // KB
        totalSize: Math.round((totalSize / 1024) * 100) / 100, // KB
        userCount: allUsers ? JSON.parse(allUsers).length : 0,
      }
    } catch (error) {
      console.error("Error getting storage stats:", error)
      return null
    }
  },
}

export const getCurrentUser = (): User | null => {
  try {
    const userStr = DataPersistence.safeGetItem("currentUser")
    if (!userStr) return null

    const user = JSON.parse(userStr)
    return DataPersistence.validateUser(user) ? user : null
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export const updateCurrentUser = (user: User): boolean => {
  try {
    if (!DataPersistence.validateUser(user)) {
      console.error("Invalid user data provided to updateCurrentUser")
      return false
    }

    const success1 = DataPersistence.safeSetItem("currentUser", JSON.stringify(user))

    // Also update in the users array
    const usersStr = DataPersistence.safeGetItem("bankUsers")
    if (usersStr) {
      const users = JSON.parse(usersStr)
      const updatedUsers = users.map((u: User) => (u.id === user.id ? user : u))
      const success2 = DataPersistence.safeSetItem("bankUsers", JSON.stringify(updatedUsers))
      return success1 && success2
    }

    return success1
  } catch (error) {
    console.error("Error updating current user:", error)
    return false
  }
}

export const logout = (): boolean => {
  try {
    const success1 = DataPersistence.safeRemoveItem("currentUser")

    if (typeof document !== "undefined") {
      document.cookie = "bankSession=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    }

    return success1
  } catch (error) {
    console.error("Error during logout:", error)
    return false
  }
}

export const getAllUsers = (): User[] => {
  try {
    const usersStr = DataPersistence.safeGetItem("bankUsers")
    if (!usersStr) return []

    const users = JSON.parse(usersStr)
    return Array.isArray(users) ? users.filter(DataPersistence.validateUser) : []
  } catch (error) {
    console.error("Error getting all users:", error)
    return []
  }
}

export const addUser = (user: User): boolean => {
  try {
    if (!DataPersistence.validateUser(user)) {
      console.error("Invalid user data provided to addUser")
      return false
    }

    const users = getAllUsers()

    // Check if user already exists
    if (users.find((u) => u.email === user.email || u.id === user.id)) {
      console.error("User already exists")
      return false
    }

    users.push(user)
    return DataPersistence.safeSetItem("bankUsers", JSON.stringify(users))
  } catch (error) {
    console.error("Error adding user:", error)
    return false
  }
}

export const deleteUser = (userId: string): boolean => {
  try {
    const users = getAllUsers()
    const filteredUsers = users.filter((u) => u.id !== userId)

    if (filteredUsers.length === users.length) {
      console.error("User not found")
      return false
    }

    return DataPersistence.safeSetItem("bankUsers", JSON.stringify(filteredUsers))
  } catch (error) {
    console.error("Error deleting user:", error)
    return false
  }
}

export const SessionManager = {
  isValidSession: (): boolean => {
    try {
      if (typeof document === "undefined") return false

      const sessionCookie = document.cookie.split("; ").find((row) => row.startsWith("bankSession="))

      const currentUser = getCurrentUser()

      return !!(sessionCookie && currentUser)
    } catch (error) {
      console.error("Error checking session validity:", error)
      return false
    }
  },

  refreshSession: (userId: string): boolean => {
    try {
      if (typeof document === "undefined") return false

      document.cookie = `bankSession=${userId}; path=/; max-age=86400` // 24 hours
      return true
    } catch (error) {
      console.error("Error refreshing session:", error)
      return false
    }
  },

  getSessionInfo: () => {
    try {
      if (typeof document === "undefined") return null

      const sessionCookie = document.cookie.split("; ").find((row) => row.startsWith("bankSession="))

      if (!sessionCookie) return null

      const userId = sessionCookie.split("=")[1]
      const currentUser = getCurrentUser()

      return {
        userId,
        isValid: !!(currentUser && currentUser.id === userId),
        user: currentUser,
      }
    } catch (error) {
      console.error("Error getting session info:", error)
      return null
    }
  },
}
