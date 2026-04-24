
"use client";

import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight, ChevronUpIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";


export const BreadcrumbComponent = ({ data }) => {
  // const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
  const router = useRouter();


  const handleHomeClick = (e) => {
    e.preventDefault();
   
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <div className="flex items-center">
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={handleHomeClick}
              href="/"
              className="text-black dark:text-white  transition-colors duration-200 font-medium"
            >
              Home
            </BreadcrumbLink>
            {data?.length && (
              <ChevronRight size={14} className="text-black dark:text-white mx-2 " />
            )}
          </BreadcrumbItem>
        </div>
        {data?.length &&
          data.map((item, index) => (
            <div key={index} className="flex items-center">
              <BreadcrumbItem>
                <Link
                  href={item.url}
                  className="text-black dark:text-white transition-colors duration-200 font-medium"
                >
                  {item.name}
                </Link>
                {index !== data.length - 1 && (
                  <ChevronRight size={14} className="text-black dark:text-white mx-2" />
                )}
              </BreadcrumbItem>
            </div>
          ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};