"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import LandingPage from "./components/LandingPage"

export default function Home() {
  const router = useRouter()

  // useEffect(() => {
  //   // If user is logged in (token exists and not expired), redirect to discover page.
  //   const token = localStorage.getItem("token")
  //   const expiresAt = localStorage.getItem("expires_at")
  //   if (token && expiresAt && Number(expiresAt) * 1000 > Date.now()) {
  //     router.push("/discover")
  //   }
  // }, [router])

  return <LandingPage />
}
