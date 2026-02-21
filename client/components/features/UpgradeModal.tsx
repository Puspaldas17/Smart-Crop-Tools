import React, { useState } from "react";
import { CheckCircle2, X, Zap, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

const FREE_FEATURES = [
  "Up to 10 crop advisories/month",
  "Basic weather forecast",
  "Market price view",
  "Guest mode access",
  "3 daily missions",
];

const PREMIUM_FEATURES = [
  "Unlimited crop advisories",
  "Priority AI responses",
  "Advanced analytics & charts",
  "Full gamification + 8 daily missions",
  "Livestock health tracking",
  "Pest detection (unlimited uploads)",
  "Priority support (24/7)",
  "Early access to new features",
];

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
      toast.success("🎉 Upgrade request sent! Our team will contact you shortly.", {
        duration: 5000,
      });
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-1 hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <DialogHeader>
            <DialogTitle className="text-white text-xl flex items-center gap-2">
              <Zap className="h-5 w-5 fill-yellow-300 text-yellow-300" />
              Upgrade to Premium
            </DialogTitle>
          </DialogHeader>
          <p className="text-green-100 text-sm mt-1">
            Unlock the full power of AgriVerse for your farm
          </p>
          <div className="mt-4 inline-flex items-end gap-1">
            <span className="text-4xl font-bold">₹299</span>
            <span className="text-green-200 mb-1">/month</span>
          </div>
        </div>

        {/* Plan Comparison */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Free Column */}
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm font-semibold text-muted-foreground mb-3">Free</p>
              <div className="space-y-2">
                {FREE_FEATURES.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Column */}
            <div className="rounded-xl border-2 border-green-500 bg-green-50/50 dark:bg-green-950/20 p-4 relative">
              <div className="absolute -top-2.5 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                RECOMMENDED
              </div>
              <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-3">Premium</p>
              <div className="space-y-2">
                {PREMIUM_FEATURES.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-medium">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl transition-all hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                Get Premium — ₹299/month
              </>
            )}
          </button>
          <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" /> Secure payment · Cancel anytime
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
