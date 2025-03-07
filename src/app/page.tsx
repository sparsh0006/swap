"use client";
import Image from "next/image";
import React from "react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { cn } from "@/lib/utils";
import { Spotlight } from "@/components/ui/spotlight";
import { FloatingDock } from "@/components/ui/floating-dock";
import dynamic from "next/dynamic";
import {
  IconBrandGithub,
  IconBrandX,
  IconExchange,
  IconHome,
  IconNewSection,
  IconTerminal2,
  IconBrandYoutube,
  IconWallet
} from "@tabler/icons-react";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";

// Dynamically import the wallet button with SSR disabled
const SolanaWalletButton = dynamic(
  () => import('@/components/ui/wallet/SolanaWalletButton'),  // import the SolanaWalletButton component
  { ssr: false }
);
 
const links = [
  {
    title: "Home",
    icon: (
      <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "#",
  },
  {
    title: "Products",
    icon: (
      <IconTerminal2 className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "#",
  },
  {
    title: "Components",
    icon: (
      <IconNewSection className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "#",
  },
  {
    title: "center",
    icon: (
      <IconBrandYoutube className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "#",
  },
  {
    title: "Changelog",
    icon: (
      <IconExchange className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "#",
  },
  {
    title: "Twitter",
    icon: (
      <IconBrandX className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "https://x.com/sparshtwt",
  },
  {
    title: "GitHub",
    icon: (
      <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "#",
  },
  {
    title: "Wallet",
    icon: (
      <IconWallet className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "#wallet",
  },
];


const words = [
  {
    text: "Build",
  },
  {
    text: "awesome",
  },
  {
    text: "apps",
  },
  {
    text: "with",
  },
  {
    text: "Aceternity.",
    className: "text-blue-500 dark:text-blue-500",
  },
];

export default function Page() {
    return (
      <div className="h-screen w-full bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
        <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
        <div className="max-w-2xl mx-auto p-4">
          <h1 className="relative z-10 text-lg md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
            SPARSH
          </h1>
          
          <TypewriterEffectSmooth words={words} />

          <p className="text-neutral-500 max-w-lg mx-auto my-2 text-sm text-center relative z-10">
            Building a instant swapping platform on jupiter that converts
            your token into $USDC instantly for so that merchant get their
            payment in stable coin.
          </p>

          <div className="relative z-10 flex items-center justify-center mt-4">
            <SolanaWalletButton />
          </div>


          <div className="flex justify-center mt-6">

              your button will be placed here.

          </div>

          <div>

            sparsh here

          </div>

          <input
            type="text"
            placeholder="hi@sparshtwt.in"
            className="rounded-lg border border-neutral-800 focus:ring-2 focus:ring-teal-500  w-full relative z-10 mt-4  bg-neutral-950 placeholder:text-white-700 text-white"
          />
        </div>
        <BackgroundBeams />

        <div className="flex items-center justify-center h-[35rem] w-full">
          <FloatingDock
            mobileClassName="translate-y-20" // only for demo, remove for production
            items={links}
          />
        </div>
      </div>
    );
}