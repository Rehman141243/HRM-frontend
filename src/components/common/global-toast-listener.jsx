"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export default function GlobalToastListener() {
  useEffect(() => {
    const onError = (event) => {
      const message = event?.detail?.message;
      if (message) toast.error(message);
    };

    const onSuccess = (event) => {
      const message = event?.detail?.message;
      if (message) toast.success(message);
    };

    window.addEventListener("app:error", onError);
    window.addEventListener("app:success", onSuccess);

    return () => {
      window.removeEventListener("app:error", onError);
      window.removeEventListener("app:success", onSuccess);
    };
  }, []);

  return null;
}
