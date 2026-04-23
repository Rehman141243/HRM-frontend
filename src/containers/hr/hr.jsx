
'use client'

import { useEffect, useMemo, useState } from "react";

import axiosInstance from "@/lib/axiosInstance";
import HRPortalContent from "./hrportalcontent";


export default function HumanResource() {
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const init = async () => {
      try {

        const res = await axiosInstance.get("/attendance/status");
        setCurrentStatus(res.data?.data ?? null);
      } catch (e) {
        console.error("Portal init failed", e);
        setCurrentStatus(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);
  return < HRPortalContent currentStatus={currentStatus} loading={loading}/>;
}

