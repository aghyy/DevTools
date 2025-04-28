"use client"

import React, { useState } from "react";
import { TopSpacing } from "@/components/top-spacing";
import { useRouter } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

import { Hammer } from "lucide-react";

export default function Dashboard() {
  const [links, setLinks] = useState([
    {
      name: "Tools",
      href: "/tools",
      src: Hammer,
    },
    {
      name: "Docs",
      href: "/docs",
      src: Hammer,
    },
    {
      name: "Knowledge Base",
      href: "/knowledge-base",
      src: Hammer,
    },
    {
      name: "Libraries",
      href: "/libraries",
      src: Hammer,
    }
  ]);

  const router = useRouter();

  const routeTo = (path: string) => {
    router.push(path);
  }

  return (
    <div className="h-full w-full">
      <div className="relative size-0">
        <Breadcrumb className="absolute z-50 left-20 top-[22px] w-max">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TopSpacing />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 w-full px-8 pt-8 pb-24 mx-auto">
        {links.map((link, index) => (
          <div key={index} className="relative w-full pb-[65%] rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:bg-black/30" onClick={() => routeTo(link.href)}>
            {/* <img src={link.src} alt={link.name} className="absolute inset-0 w-full h-full object-cover rounded-lg transition-opacity duration-300 hover:opacity-75" /> */}
            <div className="">
              <link.src />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute inset-0 p-4 flex items-center justify-center">
              <h2 className="absolute left-4 bottom-4 text-xl font-bold text-white mr-4">{link.name}</h2>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
