"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { submitAdminMutation } from "@/components/admin/submit-admin-mutation"
import type { MutationResult } from "@/lib/admin/mutation-result"
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

interface DeleteBrandDialogProps {
  brandId: string
  brandName: string
  deleteAction: (formData: FormData) => Promise<MutationResult | void>
  triggerNode?: React.ReactElement
}

export function DeleteBrandDialog({
  brandId,
  brandName,
  deleteAction,
  triggerNode,
}: DeleteBrandDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!isDeleting) setIsOpen(open) }}>
      <DialogTrigger render={triggerNode || <Button variant="destructive" />}>
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this brand?</DialogTitle>
          <DialogDescription>
            This cannot be undone. <strong>{brandName}</strong> will be
            permanently deleted.
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
                success: "Brand deleted",
                failure: "Failed to delete brand",
              })
              if (!ok) setIsDeleting(false)
            }}
          >
            <input type="hidden" name="id" value={brandId} />
            <Button type="submit" variant="destructive" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete brand
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
