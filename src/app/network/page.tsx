"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NetworkGraph from "@/components/NetworkGraph";

interface Shareholder {
  name: string;
  percent: number;
  total_shares: number;
  holding_scrip: number;
  holding_scrip_percentage: number;
  holding_scripless: number;
  holding_scripless_percentage: number;
}

interface Company {
  ticker: string;
  company: string;
  shareholders: Shareholder[];
}

export default function NetworkPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/ownership.json");
        const data: Company[] = await response.json();
        setCompanies(data);
      } catch (error) {
        console.error("Failed to load ownership data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading network data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Ownership Network Graph
          </h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="mb-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Company</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Investor</span>
          </div>
        </div>

        <NetworkGraph companies={companies} maxNodes={80} />

        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>Tip:</strong> Click on nodes to navigate to company/investor pages • 
            Drag nodes to reposition • Scroll to zoom
          </p>
        </div>
      </main>
    </div>
  );
}
