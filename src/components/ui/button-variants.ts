import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20",
  {
    variants: {
      variant: {
        default: "bg-neutral-950 text-white hover:bg-neutral-800",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline:
          "border border-neutral-200 bg-white text-neutral-950 hover:bg-neutral-100",
        secondary: "bg-neutral-100 text-neutral-950 hover:bg-neutral-200",
        ghost: "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950",
        link: "text-neutral-950 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
