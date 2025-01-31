import { createPortal } from "react-dom";
import React from "react";

export const Overlay = (props: React.ComponentPropsWithoutRef<'div'>) => {
    return (
      createPortal(
        <div {...props} className="fixed left-0 z-10 top-0 h-screen w-screen bg-foreground/70"></div>,
        document.body
      )
    );
  };
