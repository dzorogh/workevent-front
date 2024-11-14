import { createPortal } from "react-dom";

export const Overlay = (props: React.ComponentPropsWithoutRef<'div'>) => {
    return (
      createPortal(
        <div {...props} className="fixed left-0 z-0 top-0 h-screen w-screen bg-foreground/70"></div>,
        document.body
      )
    );
  };