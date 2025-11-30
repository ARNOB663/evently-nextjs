'use client';

import { motion } from 'motion/react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const footerLinks = {
  product: [
    { label: 'Explore Events', href: '#' },
    { label: 'Create Event', href: '#' },
    { label: 'Pricing', href: '#' },
    { label: 'Mobile App', href: '#' },
  ],
  company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Press Kit', href: '#' },
  ],
  support: [
    { label: 'Help Center', href: '#' },
    { label: 'Contact Us', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Privacy Policy', href: '#' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

export function Footer() {
  return (
    <footer className="bg-white relative overflow-hidden border-t border-gray-100">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 relative">
        <div className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-[1920px] py-16 sm:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                Never miss an event again
              </h3>
              <p className="text-indigo-100 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg px-4">
                Get exclusive early access to new events, special discounts, and personalized recommendations delivered weekly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-indigo-200 focus:border-white rounded-full px-6 backdrop-blur-sm"
                />
                <Button className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-full px-6 sm:px-8 whitespace-nowrap shadow-lg text-sm sm:text-base">
                  Subscribe
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-[1920px] py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-2"
          >
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-semibold text-indigo-950">Events & Activities</span>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-sm">
              Your premier platform for discovering and hosting amazing events. 
              Connect with people who share your interests.
            </p>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-2 sm:gap-3">
                <MapPin className="w-4 h-4 text-teal-500 flex-shrink-0" />
                <span className="truncate">123 Event Street, NY 10001</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Phone className="w-4 h-4 text-teal-500 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Mail className="w-4 h-4 text-teal-500 flex-shrink-0" />
                <span className="truncate">hello@eventsapp.com</span>
              </div>
            </div>
          </motion.div>

          {/* Product Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-indigo-950 mb-3 sm:mb-4 font-semibold text-sm sm:text-base">Product</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs sm:text-sm text-gray-600 hover:text-teal-600 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-indigo-950 mb-3 sm:mb-4 font-semibold text-sm sm:text-base">Company</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs sm:text-sm text-gray-600 hover:text-teal-600 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-indigo-950 mb-3 sm:mb-4 font-semibold text-sm sm:text-base">Support</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs sm:text-sm text-gray-600 hover:text-teal-600 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <p className="text-xs sm:text-sm text-gray-500">
            © 2025 Events & Activities. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gradient-to-br hover:from-teal-500 hover:to-cyan-500 rounded-full flex items-center justify-center transition-all duration-300 group"
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-white transition-colors" />
                </motion.a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

