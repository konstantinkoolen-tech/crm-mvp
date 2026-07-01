"use client";

import { type MouseEvent, useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

type AssociatedFormSubmitButtonProps = Omit<
  ButtonProps,
  "form" | "loading" | "type"
> & {
  formId: string;
};

export function AssociatedFormSubmitButton({
  formId,
  onClick,
  ...props
}: AssociatedFormSubmitButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;

    onClick?.(event);

    if (event.defaultPrevented || !form) {
      return;
    }

    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    form.requestSubmit();
    setIsSubmitting(true);
  }

  return (
    <Button
      {...props}
      form={formId}
      loading={isSubmitting}
      type="button"
      onClick={handleClick}
    />
  );
}
