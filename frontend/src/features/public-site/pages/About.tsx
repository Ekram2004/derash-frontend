// src/features/public-site/pages/About.tsx
import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import PublicLayout from "../../../shared/components/layout/PublicLayout";
import {
  UsersIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  BuildingLibraryIcon,
  RocketLaunchIcon,
  EyeIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/solid";

// Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } },
};

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 1, ease: "easeOut" } },
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 1, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const scaleOnHover: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 1 } },
};

export default function About() {
  return (
    <PublicLayout>
      {/* HERO SECTION – dark mode support */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-red-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl -translate-x-1/2 translate-y-1/2 animate-pulse delay-1000"></div>
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 lg:py-32">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              About DERASH
            </h1>
            <div className="w-24 h-1 bg-white/30 mx-auto rounded-full mb-6"></div>
            <p className="text-red-50 dark:text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Ethiopia's unified digital billing platform connecting billers,
              banks, and customers for secure, efficient, and transparent
              transactions.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-sm text-white/60 dark:text-gray-400">Discover more</span>
          <div className="w-6 h-10 border-2 border-white/30 dark:border-gray-600 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-3 bg-white/60 dark:bg-gray-400 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* PLATFORM OVERVIEW – dark mode */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-50/30 dark:from-gray-800/50 via-transparent to-transparent"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <BuildingLibraryIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Platform Overview
              </h2>
            </div>
            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed text-lg">
                DERASH is a unified bill aggregation platform that empowers
                service providers, billers, and payment agents by simplifying
                the billing and payment process. It allows various service
                providers to generate bills and enables agents such as banks
                and payment systems to process payments seamlessly on a single
                platform.
              </p>
              <p className="leading-relaxed text-lg text-gray-600 dark:text-gray-400 border-l-4 border-red-500 pl-4">
                With DERASH, transactions are faster, secure, and fully
                traceable, contributing to Ethiopia's digital economy and
                promoting a cashless ecosystem.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* KEY FEATURES – dark mode */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <span className="text-red-600 dark:text-red-400 font-semibold text-sm uppercase tracking-wider">
              What We Offer
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
              Key Features
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-400 mx-auto rounded-full"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-6 max-w-2xl mx-auto">
              Discover the powerful features that make DERASH the leading bill
              aggregation platform in Ethiopia
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <UsersIcon className="w-8 h-8" />,
                title: "Unified Users",
                desc: "Connects billers, banks, agents, and customers under one platform for seamless transactions.",
                gradient: "from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700",
                iconBg: "bg-blue-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400",
              },
              {
                icon: <CreditCardIcon className="w-8 h-8" />,
                title: "Secure Payments",
                desc: "Supports secure, real-time digital payments and reporting for all integrated services.",
                gradient: "from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-700",
                iconBg: "bg-green-100 text-green-600 dark:bg-gray-700 dark:text-green-400",
              },
              {
                icon: <ShieldCheckIcon className="w-8 h-8" />,
                title: "Trusted & Transparent",
                desc: "Provides full transparency and accountability for billers, agents, and regulators.",
                gradient: "from-red-50 to-red-100 dark:from-gray-800 dark:to-gray-700",
                iconBg: "bg-red-100 text-red-600 dark:bg-gray-700 dark:text-red-400",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className={`group relative bg-gradient-to-br ${feature.gradient} p-8 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full -translate-y-16 translate-x-16"></div>
                <div
                  className={`w-16 h-16 ${feature.iconBg} rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                <div className="mt-4 flex items-center gap-2 text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">Learn more</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* MISSION & VISION – dark mode */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-red-100 dark:bg-red-900/20 rounded-full filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-100 dark:bg-red-900/20 rounded-full filter blur-3xl opacity-30"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeInLeft}
              whileHover={{ y: -8 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden group"
            >
              <div className="bg-gradient-to-r from-red-600 to-red-500 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <RocketLaunchIcon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Our Mission</h2>
                </div>
              </div>
              <div className="p-8">
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                  To simplify payments in Ethiopia by providing a secure,
                  reliable, and unified digital billing platform for all service
                  providers and customers.
                </p>
                <div className="mt-6 flex items-center gap-2 text-red-600 dark:text-red-400">
                  <CheckBadgeIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Committed to excellence</span>
                </div>
              </div>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeInRight}
              whileHover={{ y: -8 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden group"
            >
              <div className="bg-gradient-to-r from-red-600 to-red-500 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <EyeIcon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Our Vision</h2>
                </div>
              </div>
              <div className="p-8">
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                  To lead Ethiopia towards a cashless economy and become the
                  most trusted digital payments infrastructure nationwide.
                </p>
                <div className="mt-6 flex items-center gap-2 text-red-600 dark:text-red-400">
                  <CheckBadgeIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Shaping the future</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section – dark mode */}
      <section className="bg-white dark:bg-gray-900 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-72 h-72 bg-red-600 opacity-10 rounded-full filter blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500 opacity-10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 p-12 md:p-16 text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 bg-red-600 dark:bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <BuildingLibraryIcon className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Join the DERASH Platform
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
                Be part of Ethiopia's digital payment revolution. Access secure,
                fast, and reliable bill aggregation services.
              </p>
              <motion.div variants={scaleOnHover} initial="rest" whileHover="hover">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-red-600 dark:bg-red-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 dark:hover:bg-red-600 transition-all shadow-lg"
                >
                  Get Started
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}