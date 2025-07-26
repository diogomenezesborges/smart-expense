'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress, CircularProgress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DesignSystemPage() {
  return (
    <div className="container-content py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Design System Showcase</h1>
        <p className="text-muted-foreground">
          Comprehensive design system implementation for the Smart Family Finance App
        </p>
      </div>

      {/* Buttons Section */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Various button variants and sizes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Variants</h4>
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="gradient">Gradient</Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Sizes</h4>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">States</h4>
            <div className="flex flex-wrap gap-2">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button leftIcon="💰">With Left Icon</Button>
              <Button rightIcon="→">With Right Icon</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inputs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Inputs</CardTitle>
          <CardDescription>Input variants with icons and states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Default input" />
            <Input placeholder="With helper text" helperText="This is helper text" />
            <Input placeholder="Error state" error="This field is required" />
            <Input placeholder="Success state" variant="success" />
            <Input placeholder="With left icon" leftIcon="🔍" />
            <Input placeholder="With right icon" rightIcon="✉️" />
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Sizes</h4>
            <div className="space-y-2">
              <Input size="sm" placeholder="Small input" />
              <Input size="default" placeholder="Default input" />
              <Input size="lg" placeholder="Large input" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Indicators</CardTitle>
          <CardDescription>Linear and circular progress components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Linear Progress</h4>
            <Progress value={30} label="Budget Used" showValue />
            <Progress value={65} variant="warning" label="Food Budget" showValue />
            <Progress value={85} variant="error" label="Entertainment" showValue />
            <Progress value={45} variant="success" label="Savings Goal" showValue />
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Circular Progress</h4>
            <div className="flex flex-wrap gap-4">
              <CircularProgress value={30} size="sm" showValue />
              <CircularProgress value={65} size="default" variant="warning" showValue />
              <CircularProgress value={85} size="lg" variant="error" showValue />
              <CircularProgress value={45} size="xl" variant="success" showValue />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Various badge styles and configurations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Variants</h4>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="ghost">Ghost</Badge>
              <Badge variant="gradient">Gradient</Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">With Icons</h4>
            <div className="flex flex-wrap gap-2">
              <Badge leftIcon="💰" variant="success">Income</Badge>
              <Badge rightIcon="📈" variant="info">Trending</Badge>
              <Badge removable onRemove={() => console.log('Remove badge')}>Removable</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Section */}
      <Card>
        <CardHeader>
          <CardTitle>Theme System</CardTitle>
          <CardDescription>Modern blue theme with light/dark mode support</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-16 w-full rounded-lg bg-primary"></div>
              <p className="text-xs text-center">Primary</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 w-full rounded-lg bg-success"></div>
              <p className="text-xs text-center">Success</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 w-full rounded-lg bg-warning"></div>
              <p className="text-xs text-center">Warning</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 w-full rounded-lg bg-error"></div>
              <p className="text-xs text-center">Error</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Gradients & Effects</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-16 w-full rounded-lg gradient-primary"></div>
              <div className="h-16 w-full rounded-lg elevation-3 bg-card"></div>
              <div className="h-16 w-full rounded-lg glass"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography Section */}
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>DM Sans font family with proper scaling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <h1>Heading 1 - Main Title</h1>
            <h2>Heading 2 - Section Title</h2>
            <h3>Heading 3 - Subsection</h3>
            <h4>Heading 4 - Component Title</h4>
            <h5>Heading 5 - Small Title</h5>
            <h6>Heading 6 - Caption Title</h6>
            <p className="text-base">Body text - Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            <p className="text-sm text-muted-foreground">Small text - Additional information or helper text.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}