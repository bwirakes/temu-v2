"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, PenLine } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { useOnboarding } from "@/lib/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import FormNav from "@/components/FormNav";

// ... existing code ... 