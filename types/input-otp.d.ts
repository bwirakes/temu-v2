declare module 'input-otp' {
  import * as React from 'react';

  export interface OTPInputContextSlot {
    char: string;
    hasFakeCaret: boolean;
    isActive: boolean;
  }

  export interface OTPInputContextValue {
    slots: OTPInputContextSlot[];
  }

  export const OTPInputContext: React.Context<OTPInputContextValue>;

  export interface OTPInputProps extends React.ComponentPropsWithoutRef<'input'> {
    containerClassName?: string;
  }

  export const OTPInput: React.ForwardRefExoticComponent<
    OTPInputProps & React.RefAttributes<HTMLInputElement>
  >;
} 