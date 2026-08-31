"use client"

import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { updateCustomerRoleAction } from "@/lib/admin/customer-admin"
import { submitAdminMutation } from "@/components/admin/submit-admin-mutation"

interface CustomerRoleFormProps {
  customerId: string
  currentRole: string
}

export function CustomerRoleForm({ customerId, currentRole }: CustomerRoleFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const newRole = currentRole === "admin" ? "customer" : "admin"

  function handleConfirm() {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("customer_id", customerId)
      formData.set("role", newRole)
      const ok = await submitAdminMutation(
        () => updateCustomerRoleAction(formData),
        { success: "Customer role updated", failure: "Failed to update role" }
      )
      if (ok) setIsOpen(false)
    })
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-2">Change Role</p>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!isPending) setIsOpen(open)
        }}
      >
        <DialogTrigger
          render={
            <Button variant="outline" size="sm" className="border-rose-200 hover:bg-rose-50" />
          }
        >
          {`Make ${newRole}`}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change this customer&apos;s role?</DialogTitle>
            <DialogDescription>
              This will make them a <strong>{newRole}</strong>.{" "}
              {newRole === "admin"
                ? "They will gain full access to the admin dashboard."
                : "They will lose admin access immediately."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={isPending} />}>
              Cancel
            </DialogClose>
            <Button onClick={handleConfirm} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isPending ? "Updating…" : `Make ${newRole}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
