import { Toaster as Sonner, type ToasterProps } from 'sonner';

/**
 * App-wide toast host. We force the dark theme (the whole app is dark) instead
 * of pulling in next-themes like the default shadcn registry component.
 */
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster };
