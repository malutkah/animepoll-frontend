"use client"

import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="bg-gray-200 dark:bg-gray-800 rounded-full p-2 transition-colors duration-300"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  )
}

export default ThemeToggle

