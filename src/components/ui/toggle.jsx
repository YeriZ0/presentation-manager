'use client';

import { toggleVariants } from '@/components/ui/toggle-variants';
import { cn } from '@/lib/utils';
import { Toggle as TogglePrimitive } from 'radix-ui';

function Toggle({ className, variant, size, ...props }) {
    return (
        <TogglePrimitive.Root
            data-slot="toggle"
            className={cn(toggleVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Toggle };
