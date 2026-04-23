"use client"

import * as React from "react"
import { cva } from "class-variance-authority";
import { toast } from "sonner";

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  children,
  ...props
}) {
  const lastToastKeyRef = React.useRef("");
  const isSuccessInline = typeof className === "string" && /(emerald|success)/i.test(className);

  React.useEffect(() => {
    const extractText = (node) => {
      if (typeof node === "string" || typeof node === "number") return String(node);
      if (!node || !node.props) return "";
      const child = node.props.children;
      if (Array.isArray(child)) return child.map(extractText).join(" ").trim();
      return extractText(child);
    };

    const message = extractText(children).replace(/\s+/g, " ").trim();
    if (!message) return;

    const kind = variant === "destructive" ? "error" : isSuccessInline ? "success" : "none";
    if (kind === "none") return;

    const toastKey = `${kind}:${message}`;
    if (lastToastKeyRef.current === toastKey) return;
    lastToastKeyRef.current = toastKey;

    if (kind === "error") toast.error(message);
    if (kind === "success") toast.success(message);
  }, [children, variant, isSuccessInline]);

  if (variant === "destructive" || isSuccessInline) return null;

  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}>
      {children}
    </div>
  );
}

function AlertTitle({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-heading font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className
      )}
      {...props} />
  );
}

function AlertDescription({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props} />
  );
}

function AlertAction({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2 right-2", className)}
      {...props} />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
