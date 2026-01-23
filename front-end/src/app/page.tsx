import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans dark:bg-black">
      <p className="text-primary">Primary</p>
      <p className="text-secondary">Secondary</p>
      <p className="text-black">Black</p>
      <p className="text-white">white</p>

    </div>
  );
}
