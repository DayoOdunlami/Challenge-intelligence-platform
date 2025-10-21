"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      <Link 
        href="/" 
        className="flex items-center text-gray-500 hover:text-[#006E51] transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">Home</span>
      </Link>
      
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center"
        >
          <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
          {item.href && !item.current ? (
            <Link 
              href={item.href}
              className="text-gray-500 hover:text-[#006E51] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={`${item.current ? 'text-[#006E51] font-medium' : 'text-gray-500'}`}>
              {item.label}
            </span>
          )}
        </motion.div>
      ))}
    </nav>
  );
}