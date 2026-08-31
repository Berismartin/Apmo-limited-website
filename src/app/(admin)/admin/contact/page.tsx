import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { formatDate } from "@/lib/utils"
import {
  deleteContactMessageAction,
  getAdminContactMessages,
} from "@/lib/admin/contact-admin"
import { DeleteContactMessageDialog } from "@/components/admin/delete-contact-message-dialog"
import { ContactMessageStatusActions } from "@/components/admin/contact-message-status-actions"

export default async function AdminContactPage() {
  const { messages, configured } = await getAdminContactMessages()
  const newCount = messages.filter((m) => m.status === "new").length

  return (
    <div>
      <PageHeader
        title="Contact messages"
        description={
          newCount > 0
            ? `${newCount} new ${newCount === 1 ? "message" : "messages"} from the contact form.`
            : "Messages submitted through the storefront contact form."
        }
      />

      {!configured ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Supabase isn&apos;t configured, so contact messages can&apos;t be loaded yet.
        </p>
      ) : null}

      <Card className="mt-8">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">From</th>
                  <th className="px-4 py-3 font-medium">Subject / message</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Received</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {messages.map((item) => (
                  <tr key={item.id} className="border-b align-top last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.name}</div>
                      <a
                        href={`mailto:${item.email}`}
                        className="text-xs text-muted-foreground hover:underline"
                      >
                        {item.email}
                      </a>
                    </td>
                    <td className="max-w-md px-4 py-3 text-muted-foreground">
                      {item.subject ? (
                        <p className="font-medium text-foreground">{item.subject}</p>
                      ) : null}
                      <p className="mt-1 line-clamp-2">{item.message}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          item.status === "new"
                            ? "default"
                            : item.status === "archived"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {item.status === "new"
                          ? "New"
                          : item.status === "read"
                            ? "Read"
                            : "Archived"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-end gap-2">
                        <ContactMessageStatusActions
                          messageId={item.id}
                          status={item.status}
                        />
                        <DeleteContactMessageDialog
                          messageId={item.id}
                          fromName={item.name}
                          deleteAction={deleteContactMessageAction}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {messages.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={5}>
                      No messages yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
