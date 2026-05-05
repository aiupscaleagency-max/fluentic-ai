"use client";

import { motion } from "framer-motion";
import { Translator } from "@/components/translator";

export default function TranslatePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div>
        <h1 className="text-2xl font-bold">Tolk-läge</h1>
        <p className="text-slate-400 text-sm">
          Översätt text mellan svenska, spanska, engelska, franska och arabiska — eller starta
          konversations-tolken där appen översätter åt båda sidor.
        </p>
      </div>
      <Translator />
    </motion.div>
  );
}
