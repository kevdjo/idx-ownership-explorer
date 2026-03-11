"use client";

import { useParams } from "next/navigation";
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

interface InvestorHolding {
  ticker: string;
  company: string;
  shareholder: Shareholder;
}

export default function InvestorPage() {
  const params = useParams();
  const [investorName, setInvestorName] = useState("");
  const [holdings, setHoldings] = useState<InvestorHolding[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const name = params.name as string;

  useEffect(() => {
    const loadInvestorData = async () => {
      try {
        const response = await fetch("/ownership.json");
        const data: Company[] = await response.json();
        setAllCompanies(data);

        const investorHoldings: InvestorHolding[] = [];

        for (const company of data) {
          const shareholder = company.shareholders.find(
            (s) => s.name.toLowerCase() === decodeURIComponent(name).toLowerCase()
          );

          if (shareholder) {
            investorHoldings.push({
              ticker: company.ticker,
              company: company.company,
              shareholder,
            });
          }
        }

        if (investorHoldings.length > 0) {
          setHoldings(investorHoldings);
          setInvestorName(investorHoldings[0].shareholder.name);
        } else {
          setError("Investor not found");
        }
      } catch {
        setError("Failed to load investor data");
      } finally {
        setIsLoading(false);
      }
    };

    if (name) {
      loadInvestorData();
    }
  }, [name]);

  const formatNumber = (num: number) => {
    return num.toLocaleString("id-ID");
  };

  const totalValue = holdings.reduce((sum, h) => sum + h.shareholder.total_shares, 0);
  const avgOwnership = holdings.length > 0
    ? holdings.reduce((sum, h) => sum + h.shareholder.percent, 0) / holdings.length
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading investor data...</p>
        </div>
      </div>
    );
  }

  if (error || holdings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto text-red-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error}
          </h1>
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            <svg
              className="w-5 h-5 mr-1"
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

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {investorName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Investment Portfolio
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Companies</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {holdings.length}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Shares</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {formatNumber(totalValue)}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Ownership</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {avgOwnership.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Network Graph */}
        <div className="mb-8">
          <NetworkGraph
            companies={allCompanies}
            centerNode={{ type: "investor", name: investorName }}
          />
        </div>

        {/* Holdings Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Portfolio Companies
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Ticker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Shares
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Ownership %
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Scrip
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Scripless
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {holdings.map((holding, index) => (
                  <tr
                    key={holding.ticker}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/company/${holding.ticker}`}
                        className="inline-block px-3 py-1 text-sm font-semibold text-blue-600 dark:text-blue-400
                                   bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50
                                   transition-colors"
                      >
                        {holding.ticker}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      <Link
                        href={`/company/${holding.ticker}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                      >
                        {holding.company}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-300 font-mono">
                      {formatNumber(holding.shareholder.total_shares)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold
                                     bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                        {holding.shareholder.percent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-300 font-mono">
                      {formatNumber(holding.shareholder.holding_scrip)}
                      <span className="ml-1 text-xs text-gray-400">
                        ({holding.shareholder.holding_scrip_percentage.toFixed(1)}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-300 font-mono">
                      {formatNumber(holding.shareholder.holding_scripless)}
                      <span className="ml-1 text-xs text-gray-400">
                        ({holding.shareholder.holding_scripless_percentage.toFixed(1)}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
