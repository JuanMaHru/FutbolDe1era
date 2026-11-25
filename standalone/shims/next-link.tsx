import { pathToHash } from "./routes";
export default function Link({ href, ...rest }: { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a href={pathToHash(href)} {...rest} />;
}
