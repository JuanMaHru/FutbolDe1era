import { useEffect, useState } from "react";
import { hashToPath, pathToHash } from "./routes";

export function usePathname(): string {
  const [path, setPath] = useState(() => hashToPath(window.location.hash));
  useEffect(() => {
    const on = () => setPath(hashToPath(window.location.hash));
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return path;
}

export function useRouter() {
  return { push: (path: string) => { window.location.hash = pathToHash(path); } };
}
