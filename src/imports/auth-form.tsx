You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
sign-in-1.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Props for the AuthForm component.
 */
interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The source URL or base64 string for the company logo.
   */
  logoSrc: string;
  /**
   * Alt text for the company logo for accessibility.
   */
  logoAlt?: string;
  /**
   * The main title of the form.
   */
  title: string;
  /**
   * A short description or subtitle displayed below the title.
   */
  description?: string;
  /**
   * The primary call-to-action button (e.g., social login).
   */
  primaryAction: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  /**
   * An array of secondary action buttons.
   */
  secondaryActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  }[];
  /**
   * An optional action for skipping the login process.
   */
  skipAction?: {
    label: string;
    onClick: () => void;
  };
  /**
   * Custom content to be displayed in the footer area.
   */
  footerContent?: React.ReactNode;
}

/**
 * A reusable authentication form component built with shadcn/ui.
 * It supports various providers, a customizable header, and animations.
 */
const AuthForm = React.forwardRef<HTMLDivElement, AuthFormProps>(
  (
    {
      className,
      logoSrc,
      logoAlt = "Company Logo",
      title,
      description,
      primaryAction,
      secondaryActions,
      skipAction,
      footerContent,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("flex flex-col items-center justify-center", className)}>
        <Card
          ref={ref}
          className={cn(
            "w-full max-w-sm",
            // Entrance Animation from tailwindcss-animate
            "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500"
          )}
          {...props}
        >
          <CardHeader className="text-center">
            {/* Logo rendered from src */}
            <div className="mb-4 flex justify-center ">
              <img src={logoSrc} alt={logoAlt} className="h-12 w-12 object-contain rounded-[4px]" />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
          <CardContent className="grid gap-4">
            {/* Primary Action Button */}
            <Button onClick={primaryAction.onClick} className="w-full transition-transform hover:scale-[1.03]">
              {primaryAction.icon}
              {primaryAction.label}
            </Button>

            {/* "OR" separator */}
            {secondaryActions && secondaryActions.length > 0 && (
              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>
            )}

            {/* Secondary Action Buttons */}
            <div className="grid gap-2">
              {secondaryActions?.map((action, index) => (
                <Button key={index} variant="secondary" className="w-full transition-transform hover:scale-[1.03]" onClick={action.onClick}>
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>

          {/* Skip Action Button */}
          {skipAction && (
            <CardFooter className="flex flex-col">
              <Button variant="outline" className="w-full transition-transform hover:scale-[1.03]" onClick={skipAction.onClick}>
                {skipAction.label}
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Footer */}
        {footerContent && (
          <div className="mt-6 w-full max-w-sm px-8 text-center text-sm text-muted-foreground animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500 [animation-delay:200ms]">
            {footerContent}
          </div>
        )}
      </div>
    );
  }
);
AuthForm.displayName = "AuthForm";

export { AuthForm };


demo.tsx
import { AuthForm } from "@/components/ui/sign-in-1";

// Helper components for icons to ensure correct styling
const IconGoogle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}><title>Google</title><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.386-7.439-7.574s3.344-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.85l3.25-3.138C18.189 1.186 15.479 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c6.885 0 11.954-4.823 11.954-12.015 0-.795-.084-1.588-.239-2.356H12.24z" fill="currentColor"/></svg>
);

const IconGithub = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}><title>GitHub</title><path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.085 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12Z" fill="currentColor"/></svg>
);

const IconMail = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}><title>Mail</title><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" fill="currentColor"/></svg>
);

/**
 * A demo page to showcase the AuthForm component.
 */
const AuthFormDemo = () => {
  // Your company logo from the provided base64 string
  const companyLogoSrc = "data:image/png;base64,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";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <AuthForm
        logoSrc={companyLogoSrc}
        logoAlt="21st Company Logo"
        title="Welcome Back"
        description="Enter your credentials to access your account."
        primaryAction={{
          label: "Continue with Google",
          icon: <IconGoogle className="mr-2 h-4 w-4" />,
          onClick: () => alert("Google login clicked"),
        }}
        secondaryActions={[
          {
            label: "Continue with Email",
            icon: <IconMail className="mr-2 h-4 w-4" />,
            onClick: () => alert("Email login clicked"),
          },
          {
            label: "Continue with Github",
            icon: <IconGithub className="mr-2 h-4 w-4" />,
            onClick: () => alert("Github login clicked"),
          },
        ]}
        skipAction={{
          label: "Skip for now",
          onClick: () => alert("Skip clicked"),
        }}
        footerContent={
          <>
            By logging in, you agree to our{" "}
            <u className="cursor-pointer transition-colors hover:text-primary">Terms of Service</u>{" "}
            and{" "}
            <u className="cursor-pointer transition-colors hover:text-primary">Privacy Policy</u>.
          </>
        }
      />
    </div>
  );
};

export default AuthFormDemo;

```

Copy-paste these files for dependencies:
```tsx
originui/button
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm shadow-black/5 hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm shadow-black/5 hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm shadow-black/5 hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm shadow-black/5 hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-lg px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

```
```tsx
shadcn/card
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className,
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

```

Install NPM dependencies:
```bash
@radix-ui/react-slot, class-variance-authority
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them
