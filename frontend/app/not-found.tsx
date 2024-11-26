import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-xl font-semibold">Page Not Found</AlertTitle>
          <AlertDescription className="mt-2">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. Please check the URL or return to the homepage.
          </AlertDescription>
        </Alert>
        
        <div className="text-center space-y-4">
          <p className="text-4xl font-bold text-gray-900">404</p>
          <p className="text-gray-500">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          
          <Link href="/dashboard" className="inline-block">
            <Button variant="default" size="lg" className="mt-4">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}