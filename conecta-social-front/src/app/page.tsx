import Counter from "@/features/counter/Counter";

export default function Home() {
  return (
    <main>
      <title>Hello World</title>
      <h1>Hello world!</h1>
      <Counter />
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
