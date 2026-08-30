import {
  CheckCircle2,
  Sprout,
  Mic,
  WifiOff,
  CloudSun,
  Languages,
  Brain,
  Shield,
} from "lucide-react";

import React, { useState, Suspense, startTransition } from "react";
const Chatbot = React.lazy(() => import("@/components/features/Chatbot"));
const MarketCard = React.lazy(() => import("@/components/features/MarketCard"));
const WeatherCard = React.lazy(
  () => import("@/components/features/WeatherCard"),
);
const PestDetector = React.lazy(
  () => import("@/components/features/PestDetector"),
);
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";

const FeatureTiles = React.lazy(
  () => import("@/components/features/FeatureTiles"),
);
const AdvisoryWidget = React.lazy(
  () => import("@/components/features/AdvisoryWidget"),
);
const UnifiedOverview = React.lazy(
  () => import("@/components/features/UnifiedOverview"),
);
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import CTA from "@/components/home/CTA";
export default function Index() {
  const { farmer } = useAuth();
  const { t } = useTranslation();

  if (farmer) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-8 md:space-y-16">
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <CTA />
    </div>
  );
}
