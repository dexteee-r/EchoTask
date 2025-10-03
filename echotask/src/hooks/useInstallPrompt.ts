import { useEffect, useState } from "react";

export function useIOSInstallHint() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const inStandalone = (window.navigator as any).standalone === true;
    if (isIOS && !inStandalone) setShow(true);
  }, []);
  return { show, dismiss: () => setShow(false) };
}
