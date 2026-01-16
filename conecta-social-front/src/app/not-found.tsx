import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <title>Not Found</title>
      <h1>Page Not Found</h1>
      <p>
        Visit{" "}
        <a href="https://nextjs.org" target="_blank">
          nextjs.org
        </a>{" "}
        to learn how to build Next.js apps.
      </p>
    </main>
  );
}
