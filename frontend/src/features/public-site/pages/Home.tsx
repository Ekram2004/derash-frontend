import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useRef } from "react";
import PublicLayout from "../../../shared/components/layout/PublicLayout";
import {
  ShieldCheckIcon,
  ArrowRightIcon,
  ChartBarIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  UserGroupIcon,
  CheckCircleIcon,
  BoltIcon,
  CurrencyDollarIcon,
  LockClosedIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/solid";

// Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
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
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <PublicLayout>
      {/* HERO SECTION – dark mode support */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-red-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white"
        style={{ minHeight: "calc(100vh - 80px)" }}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse delay-1000"></div>
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 min-h-[calc(100vh-80px)] flex items-center"
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-20">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInLeft}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
                National Bill{" "}
                <span>Aggregation Platform</span>
              </h1>

              <p className="text-lg md:text-xl text-red-50/90 dark:text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                DERASH is Ethiopia's unified digital billing platform that
                connects billers, banks, and payment providers to enable secure
                and seamless bill payments.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <motion.div
                  variants={scaleOnHover}
                  initial="rest"
                  whileHover="hover"
                >
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all text-center text-lg"
                  >
                    Access Platform
                    <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                </motion.div>

                <motion.div
                  variants={scaleOnHover}
                  initial="rest"
                  whileHover="hover"
                >
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-2 bg-red-800/30 dark:bg-gray-700/50 border border-red-300 dark:border-gray-600 text-white px-8 py-4 rounded-xl font-bold backdrop-blur-sm hover:bg-opacity-50 transition-all text-center text-lg"
                  >
                    Learn More
                  </Link>
                </motion.div>
              </div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center lg:justify-start gap-6 mt-12 pt-6 border-t border-white/20 dark:border-gray-700"
              >
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 dark:bg-gray-700 border-2 border-red-500 dark:border-red-400 flex items-center justify-center text-xs font-bold text-white">
                    ✓
                  </div>
                </div>
                <span className="text-sm text-white/80 dark:text-gray-400">
                  Trusted by 16+ banks & 370K+ users
                </span>
              </motion.div>
            </motion.div>

            {/* Hero Card - Enhanced (dark mode support) */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInRight}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-300 dark:from-gray-700 dark:to-gray-600 rounded-3xl blur-2xl opacity-30 -z-10"></div>
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-red-50 to-white dark:from-gray-700 dark:to-gray-800 p-6 border-b border-red-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <ShieldCheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        DERASH Platform
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Secure • Reliable • Scalable
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <ul className="space-y-4">
                    {[
                      {
                        text: "Unified billing infrastructure",
                        icon: <BuildingLibraryIcon className="w-6 h-6" />,
                      },
                      {
                        text: "Secure digital payments",
                        icon: <LockClosedIcon className="w-6 h-6" />,
                      },
                      {
                        text: "Integration with banks and wallets",
                        icon: <CreditCardIcon className="w-6 h-6" />,
                      },
                      {
                        text: "Real-time transaction reporting",
                        icon: <ChartBarIcon className="w-6 h-6" />,
                      },
                    ].map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <span className="text-red-500 dark:text-red-400">{item.icon}</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                          {item.text}
                        </span>
                        <CheckCircleIcon className="ml-auto w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.li>
                    ))}
                  </ul>

                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Status</span>
                      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        All systems operational
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-sm text-white/60 dark:text-gray-400">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-white/30 dark:border-gray-600 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-3 bg-white/60 dark:bg-gray-400 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* PLATFORM FLOW */}
      <section className="py-28 bg-white dark:bg-gray-900 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-50/50 dark:from-gray-800/50 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <span className="text-red-600 dark:text-red-400 font-semibold text-sm uppercase tracking-wider">
              Process
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
              How DERASH Works
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-400 mx-auto rounded-full"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-6 max-w-2xl mx-auto">
              A seamless flow connecting billers, agents, and customers in one unified ecosystem
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="relative"
          >
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-red-200 via-red-300 to-red-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 hidden lg:block -translate-y-1/2"></div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Billers",
                  desc: "Service providers upload bill data to the platform.",
                  icon: <ComputerDesktopIcon className="w-8 h-8" />,
                  color: "from-blue-500 to-blue-600",
                },
                {
                  title: "DERASH",
                  desc: "The platform securely distributes bill data to agents.",
                  icon: <BoltIcon className="w-8 h-8" />,
                  color: "from-red-500 to-red-600",
                },
                {
                  title: "Agents",
                  desc: "Banks and operators collect payments from customers.",
                  icon: <BuildingLibraryIcon className="w-8 h-8" />,
                  color: "from-green-500 to-green-600",
                },
                {
                  title: "Customers",
                  desc: "Receive bill payment confirmation via SMS.",
                  icon: <UserGroupIcon className="w-8 h-8" />,
                  color: "from-purple-500 to-purple-600",
                },
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  whileHover={{ y: -8 }}
                  className="relative group"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 relative z-10">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${step.color} text-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      {step.icon}
                    </div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-red-600 dark:bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                      {idx + 1}
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                  {idx < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-8 text-red-400 dark:text-gray-500 z-20">
                      <ArrowRightIcon className="w-6 h-6" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* PLATFORM STATS – dark mode adapted */}
      <section className="bg-gradient-to-br from-red-700 via-red-600 to-red-500 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute -bottom-24 -left-24 w-96 h-96 fill-white" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" />
          </svg>
          <svg className="absolute -top-24 -right-24 w-96 h-96 fill-white" viewBox="0 0 100 100">
            <rect x="25" y="25" width="50" height="50" rx="10" />
          </svg>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Platform Impact</h2>
            <p className="text-red-100 dark:text-gray-300 max-w-2xl mx-auto">
              Driving digital transformation across Ethiopia's payment ecosystem
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-center">
            {[
              { label: "Active Users", val: "370K+", suffix: "", delay: 0 },
              { label: "Transactions", val: "650K+", suffix: "", delay: 0.1 },
              { label: "Birr Processed", val: "60", suffix: "B+", delay: 0.2 },
              { label: "Integrated Banks", val: "16", suffix: "+", delay: 0.3 },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: stat.delay, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white/10 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700 hover:bg-white/20 dark:hover:bg-gray-800/60 transition-all"
              >
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-2 tracking-tight">
                  {stat.val}
                  <span className="text-3xl">{stat.suffix}</span>
                </h3>
                <p className="text-red-100 dark:text-gray-400 font-medium uppercase tracking-wider text-xs md:text-sm">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS – dark mode */}
      <section className="py-28 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-red-600 dark:text-red-400 font-semibold text-sm uppercase tracking-wider">
              Why Choose Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mt-2">
              Benefits of DERASH
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-400 mx-auto mt-4 rounded-full"></div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Digital Transformation",
                desc: "Supports the national digital economy by enabling secure electronic payments.",
                icon: <ComputerDesktopIcon className="w-7 h-7" />,
                gradient: "from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700",
                iconBg: "bg-blue-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400",
              },
              {
                title: "Cashless Economy",
                desc: "Promotes cashless transactions and improves financial accessibility across the country.",
                icon: <CurrencyDollarIcon className="w-7 h-7" />,
                gradient: "from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-700",
                iconBg: "bg-green-100 text-green-600 dark:bg-gray-700 dark:text-green-400",
              },
              {
                title: "Secure Ecosystem",
                desc: "Ensures secure payment processing and transparent financial settlement for billers and agents.",
                icon: <ShieldCheckIcon className="w-7 h-7" />,
                gradient: "from-red-50 to-red-100 dark:from-gray-800 dark:to-gray-700",
                iconBg: "bg-red-100 text-red-600 dark:bg-gray-700 dark:text-red-400",
              },
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -12 }}
                className={`group relative bg-gradient-to-br ${benefit.gradient} p-8 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full -translate-y-16 translate-x-16"></div>
                <div
                  className={`w-14 h-14 ${benefit.iconBg} rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}
                >
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {benefit.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA – dark mode support */}
      <section className="bg-white dark:bg-gray-900 py-28">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Animated background */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-72 h-72 bg-red-600 opacity-10 rounded-full filter blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500 opacity-10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
              <svg className="absolute bottom-0 left-0 w-full h-32 opacity-5" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="white"></path>
              </svg>
            </div>

            <div className="relative z-10 p-12 md:p-16 text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 bg-red-600 dark:bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <BoltIcon className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Ready to Access DERASH?
              </h2>
              <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
                Log in to manage bills, payments, and financial reports with our
                secure unified platform.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-red-600 dark:bg-red-500 text-white px-10 py-4 rounded-xl font-bold hover:bg-red-700 dark:hover:bg-red-600 transition-all shadow-lg text-lg"
                >
                  Go to Login
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