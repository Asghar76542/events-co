import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <h2 className="text-xl font-semibold text-muted-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground max-w-md">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex gap-2 justify-center">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin">Go to Admin</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}