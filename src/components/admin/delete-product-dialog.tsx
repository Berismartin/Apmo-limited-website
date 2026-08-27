"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { submitAdminMutation } from "@/components/admin/submit-admin-mutation"
import type { MutationResult } from "@/lib/admin/mutation-result"
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

interface DeleteProductDialogProps {
  productId: string
  productName: string
  deleteAction: (formData: FormData) => Promise<MutationResult | void>
  triggerNode?: React.ReactElement
}

export function DeleteProductDialog({
  productId,
  productName,
  deleteAction,
  triggerNode,
}: DeleteProductDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!isDeleting) setIsOpen(open) }}>
      <DialogTrigger render={triggerNode || <Button variant="destructive" />}>
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete <strong>{productName}</strong> and remove all its data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={isDeleting} />}>
            Cancel
          </DialogClose>
          <form
            action={async (formData) => {
              setIsDeleting(true)
              const ok = await submitAdminMutation(() => deleteAction(formData), {
                success: "Product deleted",
                failure: "Failed to delete product",
              })
              if (!ok) setIsDeleting(false)
            }}
          >
            <input type="hidden" name="id" value={productId} />
            <Button type="submit" variant="destructive" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete Product
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
