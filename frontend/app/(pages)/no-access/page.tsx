import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, Activity, Star, Share2, Bookmark, LayoutDashboard, History, Settings } from "lucide-react";
import Link from "next/link";

export default function NoAccess() {
  return (
    <div className="flex flex-col justify-center h-screen max-w-4xl mx-auto">
      <Alert className="mb-8">
        <Lock className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Some features require you to be logged in to access them.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Tracking
            </CardTitle>
            <CardDescription>
              Track your usage history and get personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Monitor your tool usage patterns and get insights into your development workflow.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Favorite Tools
            </CardTitle>
            <CardDescription>
              Save and organize your most-used tools for quick access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create a personalized collection of your favorite development tools.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Snippet Sharing
            </CardTitle>
            <CardDescription>
              Share and discover code snippets with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Publish your code snippets and collaborate with other developers.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              Bookmarks
            </CardTitle>
            <CardDescription>
              Save and organize your favorite resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Keep track of useful documentation, articles, and resources for quick reference.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              Custom Dashboard
            </CardTitle>
            <CardDescription>
              Personalize your development workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Arrange your tools and widgets to create your ideal development environment.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Usage History
            </CardTitle>
            <CardDescription>
              View your past activities and tool usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Access your complete history of tool usage and activities for better organization.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Custom Settings
            </CardTitle>
            <CardDescription>
              Configure your development environment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Save your preferences and settings for a personalized development experience.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button asChild size="lg">
          <Link href="/auth/login">
            Sign in to Access Features
          </Link>
        </Button>
      </div>
    </div>
  );
}