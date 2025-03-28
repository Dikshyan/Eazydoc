"use client"

import { withRoleAccess } from "@/context/auth-context"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import LabResultsList from "@/components/dashboard/lab-results-list"

function LabResultsPage() {
  return (
    <DashboardLayout>
      <LabResultsList />
    </DashboardLayout>
  )
}

export default withRoleAccess(LabResultsPage, ['patient'])