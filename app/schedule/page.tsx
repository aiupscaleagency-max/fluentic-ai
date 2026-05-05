"use client";

import { motion } from "framer-motion";
import { Scheduler } from "@/components/scheduler";

export default function SchedulePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div>
        <h1 className="text-2xl font-bold">Schema & påminnelser</h1>
        <p className="text-slate-400 text-sm">
          Välj en mall för enklast möjliga start, eller bygg ditt eget upplägg.
        </p>
      </div>
      <Scheduler />
    </motion.div>
  );
}
