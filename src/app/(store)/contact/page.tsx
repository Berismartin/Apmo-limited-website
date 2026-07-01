"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Globe, Mail, MapPin, MessageCircle } from "lucide-react"
import { toast } from "sonner"
import { contactFormSchema } from "@/lib/validators"

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const result = contactFormSchema.safeParse(form)
    if (!result.success) {
      toast.error(result.error.issues[0].message)
      return
    }

    setLoading(true)
    // In production, send to hello@apmoug.com via an API route or form service.
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.")
      setForm({ name: "", email: "", subject: "", message: "" })
      setLoading(false)
    }, 500)
  }

  return (
    <div className="bg-[#fff8f1]">
      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-600">
            Contact Apmo
          </p>
          <h1 className="mt-4 font-serif text-5xl italic leading-[0.95] tracking-[-0.05em] text-[#351426] sm:text-7xl">
            Tell us your hair story. We will help with the next step.
          </h1>
          <p className="mt-6 text-lg leading-8 text-[#6c4354]">
            Ask about products, consultations, hair rituals, orders, or the
            upcoming full website launch. The form is ready for a future API or
            form-service integration.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4">
            {[
              {
                icon: Mail,
                title: "Email",
                content: (
                  <a
                    href="mailto:hello@apmoug.com"
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                  >
                    hello@apmoug.com
                  </a>
                ),
              },
              {
                icon: Globe,
                title: "Website",
                content: (
                  <a
                    href="https://apmoug.com"
                    target="_blank"
                    rel="noopener"
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                  >
                    apmoug.com
                  </a>
                ),
              },
              {
                icon: MapPin,
                title: "Studio",
                content: <p className="text-sm text-muted-foreground">Uganda</p>,
              },
              {
                icon: Clock,
                title: "Best for",
                content: (
                  <p className="text-sm text-muted-foreground">
                    Product guidance, orders, and consultation questions.
                  </p>
                ),
              },
            ].map((item) => (
              <Card key={item.title} className="border-rose-100 bg-white/90 shadow-xl shadow-rose-950/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <item.icon className="h-4 w-4 text-rose-600" />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>{item.content}</CardContent>
              </Card>
            ))}

            <Card className="border-rose-100 bg-[#351426] text-white shadow-xl shadow-rose-950/10">
              <CardContent className="p-6">
                <MessageCircle className="h-6 w-6 text-rose-200" />
                <h2 className="mt-5 font-serif text-3xl italic tracking-[-0.04em]">
                  Need a routine?
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Share your texture, current routine, and biggest challenge so
                  Apmo can recommend a practical product path.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-rose-100 bg-white/95 shadow-2xl shadow-rose-950/10">
            <CardContent className="p-6 sm:p-8">
              <div className="mb-8">
                <h2 className="font-serif text-4xl italic tracking-[-0.05em] text-[#351426]">
                  Send a message
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Include your hair goals, current products, and whether you are
                  shopping for yourself, a child, or a protective style.
                </p>
              </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Product guidance, consultation, or order question"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  aria-required="true"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us about your hair goals, routine, or question..."
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  required
                  aria-required="true"
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      </section>
    </div>
  )
}
