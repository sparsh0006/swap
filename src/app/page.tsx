import Image from "next/image";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import Link from "next/link";

"use client";
import React from "react";
import { BackgroundBeams } from "@/components/ui/background-beams";

export default function Page() {
    return (
      <div className="h-screen w-full bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
        <div className="max-w-2xl mx-auto p-4">
          <h1 className="relative z-10 text-lg md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
            SPARSH
          </h1>
          <p></p>
          <p className="text-neutral-500 max-w-lg mx-auto my-2 text-sm text-center relative z-10">
            Building a instant swapping platform on jupiter that converts
            your token into $USDC instantly for so that merchant get their
            payment in stable coin.
          </p>
          <input
            type="text"
            placeholder="hi@sparshtwt.in"
            className="rounded-lg border border-neutral-800 focus:ring-2 focus:ring-teal-500  w-full relative z-10 mt-4  bg-neutral-950 placeholder:text-white-700 text-white"
          />
        </div>
        <BackgroundBeams />

        <div>
          added token fetching functionalities.
        </div>
      </div>
    );
}

