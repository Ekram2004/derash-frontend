// src/features/public-site/pages/Contact.tsx
import { motion, type Variants } from "framer-motion";
import PublicLayout from "../../../shared/components/layout/PublicLayout";
import {
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftEllipsisIcon,
  MapPinIcon,
  ClockIcon,
  BuildingLibraryIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/solid";
import { FaTelegramPlane, FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";

// Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const scaleOnHover: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

export default function Contact() {
  return (
    <PublicLayout>
      {/* HERO SECTION – dark mode support */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-red-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse delay-1000"></div>
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
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20 dark:border-white/10"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-white/90 dark:text-white/80">
                24/7 Support
              </span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Contact DERASH
            </h1>
            <div className="w-24 h-1 bg-white/30 mx-auto rounded-full mb-6"></div>
            <p className="text-red-50 dark:text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Have questions or need support? Reach out to us through any of the
              channels below.
            </p>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-sm text-white/60 dark:text-gray-400">Get in touch</span>
          <div className="w-6 h-10 border-2 border-white/30 dark:border-gray-600 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-3 bg-white/60 dark:bg-gray-400 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* CONTACT INFO – dark mode */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-50/30 dark:from-red-900/10 via-transparent to-transparent"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <span className="text-red-600 dark:text-red-400 font-semibold text-sm uppercase tracking-wider">
              Connect With Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
              Get in Touch
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-400 mx-auto rounded-full"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-6 max-w-2xl mx-auto">
              We're here to help! Choose your preferred way to reach us
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Email Card */}
            <motion.div
              variants={fadeInLeft}
              whileHover={{ y: -8 }}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-700 dark:to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative p-6 flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <EnvelopeIcon className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Email</h3>
                  <a
                    href="mailto:support@derash.gov.et"
                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-lg"
                  >
                    support@derash.gov.et
                  </a>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Response within 24 hours
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Phone Card */}
            <motion.div
              variants={fadeInRight}
              whileHover={{ y: -8 }}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-700 dark:to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative p-6 flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <PhoneIcon className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Phone</h3>
                  <a
                    href="tel:+251110000000"
                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-lg"
                  >
                    +251 11 000 0000
                  </a>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Mon-Fri, 9:00 AM - 5:00 PM
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Telegram Card */}
            <motion.div
              variants={fadeInLeft}
              whileHover={{ y: -8 }}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-700 dark:to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative p-6 flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <FaTelegramPlane className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
                    Telegram
                  </h3>
                  <a
                    href="https://t.me/derash_official"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-lg"
                  >
                    @derash_official
                  </a>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Instant messaging support
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Facebook Card */}
            <motion.div
              variants={fadeInRight}
              whileHover={{ y: -8 }}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-700 dark:to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative p-6 flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <FaFacebookF className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
                    Facebook
                  </h3>
                  <a
                    href="https://facebook.com/derashgov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-lg"
                  >
                    facebook.com/derashgov
                  </a>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Follow us for updates
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Address Card - Full Width */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -8 }}
              className="md:col-span-2 group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-700 dark:to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="relative p-6 flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <MapPinIcon className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
                    Office Address
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    National Information Security Administration, Addis Ababa,
                    Ethiopia
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      Mon-Fri: 9:00 AM - 5:00 PM
                    </span>
                    <span className="flex items-center gap-1">
                      <BuildingLibraryIcon className="w-4 h-4" />
                      Government Institution
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* BUSINESS HOURS & RESPONSE TIME – dark mode */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInLeft}
              className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <ClockIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Business Hours
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    Monday - Friday
                  </span>
                  <span className="text-gray-900 dark:text-white">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Saturday</span>
                  <span className="text-gray-900 dark:text-white">10:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Sunday</span>
                  <span className="text-gray-900 dark:text-white">Closed</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInRight}
              className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <ChatBubbleLeftEllipsisIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Response Time
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 py-2">
                  <CheckBadgeIcon className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Email responses within <strong className="text-gray-900 dark:text-white">24 hours</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <CheckBadgeIcon className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Phone support available during <strong className="text-gray-900 dark:text-white">business hours</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <CheckBadgeIcon className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Telegram messages typically answered within <strong className="text-gray-900 dark:text-white">1-2 hours</strong>
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MAP PLACEHOLDER / LOCATION – dark mode */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Find Us Here
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-400 mx-auto rounded-full"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="relative h-96 w-full">
              <iframe
                title="DERASH Location"
                src="https://www.google.com/maps?q=National+Information+Security+Administration,+Addis+Ababa,+Ethiopia&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SOCIAL MEDIA LINKS – dark mode */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Connect With Us
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-400 mx-auto rounded-full"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-6">
              Follow us on social media for updates and announcements
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex justify-center gap-6 flex-wrap"
          >
            {[
              {
                icon: <FaTelegramPlane className="w-7 h-7" />,
                name: "Telegram",
                url: "https://t.me/derash_official",
                color: "hover:bg-blue-500",
              },
              {
                icon: <FaFacebookF className="w-7 h-7" />,
                name: "Facebook",
                url: "https://facebook.com/derashgov",
                color: "hover:bg-blue-600",
              },
              {
                icon: <FaTwitter className="w-7 h-7" />,
                name: "Twitter",
                url: "https://twitter.com/derashgov",
                color: "hover:bg-sky-500",
              },
              {
                icon: <FaLinkedinIn className="w-7 h-7" />,
                name: "LinkedIn",
                url: "https://linkedin.com/company/derash",
                color: "hover:bg-blue-700",
              },
            ].map((social, idx) => (
              <motion.a
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 px-6 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ${social.color} hover:text-white group`}
              >
                <span className="text-red-600 dark:text-red-400 group-hover:text-white transition-colors">
                  {social.icon}
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors">
                  {social.name}
                </span>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section – dark mode */}
      <section className="bg-gray-900 dark:bg-gray-800 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-red-700 to-red-600 dark:from-gray-900 dark:to-gray-800 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-72 h-72 bg-white opacity-10 rounded-full filter blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 p-12 md:p-16 text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <ChatBubbleLeftEllipsisIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Need Immediate Assistance?
              </h2>
              <p className="text-red-100 dark:text-gray-300 text-lg mb-8 max-w-xl mx-auto">
                Our support team is ready to help you with any questions about
                the DERASH platform.
              </p>
              <motion.div variants={scaleOnHover} initial="rest" whileHover="hover">
                <a
                  href="tel:+251110000000"
                  className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-gray-800 transition-all shadow-lg"
                >
                  Call Support Now
                  <ArrowRightIcon className="w-5 h-5" />
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}