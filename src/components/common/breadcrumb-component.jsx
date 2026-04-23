// "use client";

// import React from "react";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { Link } from "@/i18n/routing";
// import { useLocale } from "next-intl";
// import { getTextDirection } from "@/i18n/routing";
// import { ChevronRight, ChevronLeft } from "lucide-react";
// import { useTranslations } from "next-intl";
// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";

// export const BreadcrumbComponent = ({ data }) => {
//   const locale = useLocale();
//   const direction = getTextDirection(locale);
//   const isRTL = direction === "rtl";
//   const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
//   const t = useTranslations("sidebar.common");
//   const router = useRouter();
//   const { data: session } = useSession();
//   const role = (session?.user?.role || "").toLowerCase();

//   const handleHomeClick = (e) => {
//     e.preventDefault();
//     if (role === "merchant") router.replace(`/${locale}/merchant/dashboard`);
//     if (role === "agent" || role === "admin")
//       router.replace(`/${locale}/agent/dashboard`);
//   };

//   return (
//     <Breadcrumb>
//       <BreadcrumbList>
//         <div className="flex items-center">
//           <BreadcrumbItem>
//             <BreadcrumbLink
//               onClick={handleHomeClick}
//               href="/"
//               className="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium"
//             >
//               {t("home")}
//             </BreadcrumbLink>
//             {data?.length && (
//               <ChevronIcon size={18} className="text-orange-500 " />
//             )}
//           </BreadcrumbItem>
//         </div>
//         {data?.length &&
//           data.map((item, index) => (
//             <div key={index} className="flex items-center">
//               <BreadcrumbItem>
//                 <Link
//                   href={item.url}
//                   className="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium"
//                 >
//                   {item.name}
//                 </Link>
//                 {index !== data.length - 1 && (
//                   <ChevronIcon size={18} className="text-orange-500 mx-2" />
//                 )}
//               </BreadcrumbItem>
//             </div>
//           ))}
//       </BreadcrumbList>
//     </Breadcrumb>
//   );
// };
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