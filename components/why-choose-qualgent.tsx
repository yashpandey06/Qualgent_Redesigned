import React from "react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Tests that don't break",
    description: "Our AI adapts to UI changes automatically. No more fixing broken tests every sprint.",
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
        <path d="M8 24l8-8" stroke="#FFA940" strokeWidth="2" strokeLinecap="round"/>
        <rect x="18" y="6" width="8" height="8" rx="2" stroke="#FFA940" strokeWidth="2"/>
        <rect x="4" y="20" width="8" height="8" rx="2" stroke="#FFA940" strokeWidth="2"/>
      </svg>
    ),
    highlight: true,
  },
  {
    title: "Test like a human",
    description: "Clicks, scrolls, and swipes just like your users do. Real device testing with human-like interactions.",
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
        <path d="M16 6l4 8h-8l4-8zM16 26v-6" stroke="#FFA940" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="16" cy="24" r="2" fill="#FFA940"/>
      </svg>
    ),
  },
  {
    title: "Anyone can write tests",
    description: "No coding needed. PMs, designers, and QA can all write comprehensive tests in plain English.",
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
        <path d="M16 6v20M6 16h20" stroke="#FFA940" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="16" cy="16" r="4" stroke="#FFA940" strokeWidth="2"/>
      </svg>
    ),
  },
];

export default function WhyChooseQualgent({ id }: { id?: string }) {
  return (
    <section id={id} className="w-full bg-black py-16 px-4">
      <motion.div
        className="max-w-5xl mx-auto text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <motion.h2
          className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 bg-clip-text text-transparent mb-2"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Why Choose QualGent?
        </motion.h2>
        <motion.p
          className="text-lg text-neutral-400"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Experience the future of app testing with AI-powered automation that thinks like your users
        </motion.p>
      </motion.div>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.15
            }
          }
        }}
      >
        {features.map((feature, idx) => (
          <motion.div
            key={feature.title}
            className="relative rounded-2xl border border-neutral-800 transition-colors duration-200 p-7 bg-neutral-950/80 flex flex-col h-full shadow-lg hover:border-orange-400 hover:bg-orange-950/20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 + idx * 0.15 }}
            viewport={{ once: true }}
          >
            <div className="mb-5 flex items-center justify-center w-12 h-12 rounded-full bg-orange-950/40">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-neutral-300 text-base leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
} 