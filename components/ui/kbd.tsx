import * as React from "react"

import { cn } from "@/lib/utils"

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
    return (
        <kbd
            className={cn(
                "inline-flex h-5 items-center rounded border bg-muted px-1 font-mono text-[0.7rem] font-medium",
                className
            )}
            {...props}
        />
    )
}

export { Kbd }
