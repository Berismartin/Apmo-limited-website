"use client"

import { useTransition } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { updateCustomerRoleAction } from "@/lib/admin/customer-admin"

interface CustomerRoleFormProps {
  customerId: string
  currentRole: string
}

export function CustomerRoleForm({ customerId, currentRole }: CustomerRoleFormProps) {
  const [isPending, startTransition] = useTransition()
  const newRole = currentRole === "admin" ? "customer" : "admin"

  function handleClick() {
    if (!confirm(`Are you sure you want to change this user's role to "${newRole}"?`)) {
      return
    }

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.set("customer_id", customerId)
        formData.set("role", newRole)
        await updateCustomerRoleAction(formData)
      } catch (error) {
        if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error
        toast.error(error instanceof Error ? error.message : "Failed to update role")
      }
    })
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-2">Change Role</p>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isPending}
        className="border-rose-200 hover:bg-rose-50"
      >
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isPending ? "Updating…" : `Make ${newRole}`}
      </Button>
    </div>
  )
}
