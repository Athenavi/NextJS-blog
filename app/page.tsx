import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">Content Management Platform</h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
              A comprehensive platform for managing articles, user interactions, and content creation with advanced
              role-based access control.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-blue-600 dark:text-blue-400">Article Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create, edit, and publish articles with multilingual support and advanced content management features.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-green-600 dark:text-green-400">User Interactions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Engage with hierarchical comments, user subscriptions, notifications, and social features.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-purple-600 dark:text-purple-400">Role-Based Access</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Comprehensive permission system with admin, moderator, author, and user roles for secure content
                  management.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Ready to get started?</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Join our platform and start managing your content with powerful tools and features.
            </p>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/auth/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
