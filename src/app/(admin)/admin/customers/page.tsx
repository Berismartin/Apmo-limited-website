import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { createSupabaseAdminClient } from "@/lib/supabase/server"

interface ProfileRow {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  role: string
  created_at: string
}

export default async function AdminCustomersPage() {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, role, created_at")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  const customers = (data ?? []) as ProfileRow[]

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`${customers.length} registered user${customers.length !== 1 ? "s" : ""}.`}
      />

      <Card className="mt-8">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b last:border-0">
                    <td className="px-4 py-4 font-medium">
                      {[customer.first_name, customer.last_name].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{customer.email ?? "—"}</td>
                    <td className="px-4 py-4">
                      <Badge variant={customer.role === "admin" ? "default" : "secondary"}>
                        {customer.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {customers.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={4}>
                      No registered users yet.
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
