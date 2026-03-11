"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

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

interface Investor {
  name: string;
  holdings: {
    ticker: string;
    company: string;
    percent: number;
    total_shares: number;
  }[];
}

type SearchMode = "company" | "investor";

const ITEMS_PER_PAGE = 20;

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchMode, setSearchMode] = useState<SearchMode>("company");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/ownership.json");
        const data: Company[] = await response.json();
        setCompanies(data);

        const investorMap = new Map<string, Investor>();

        data.forEach((company) => {
          company.shareholders.forEach((shareholder) => {
            if (!investorMap.has(shareholder.name)) {
              investorMap.set(shareholder.name, {
                name: shareholder.name,
                holdings: [],
              });
            }

            const investor = investorMap.get(shareholder.name)!;
            investor.holdings.push({
              ticker: company.ticker,
              company: company.company,
              percent: shareholder.percent,
              total_shares: shareholder.total_shares,
            });
          });
        });

        const investorList = Array.from(investorMap.values());
        setInvestors(investorList);
      } catch (error) {
        console.error("Failed to load ownership data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredCompanies = companies
    .filter((c) => {
      if (!searchQuery.trim()) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        c.ticker.toLowerCase().includes(searchLower) ||
        c.company.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => a.company.localeCompare(b.company));

  const filteredInvestors = investors
    .filter((i) => {
      if (!searchQuery.trim()) return true;
      return i.name.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const currentItems = searchMode === "company" ? filteredCompanies : filteredInvestors;
  const totalPages = Math.ceil(currentItems.length / ITEMS_PER_PAGE);
  const paginatedItems = currentItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("id-ID");
  };

  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-700 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    const showPages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    const endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                     text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        {pages.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-gray-500 dark:text-gray-400"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page as number)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                page === currentPage
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                     text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            IDX Ownership Explorer
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore and analyze ownership data from the Indonesia Stock Exchange
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => { setSearchMode("company"); handleSearch(""); }}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                searchMode === "company"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Search by Company
              </div>
            </button>
            <button
              onClick={() => { setSearchMode("investor"); handleSearch(""); }}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                searchMode === "investor"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Search by Investor
              </div>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={
                searchMode === "company"
                  ? "Search by ticker or company name..."
                  : "Search by investor name..."
              }
              className="w-full px-5 py-4 pr-12 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         placeholder-gray-400 dark:placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-200 shadow-sm"
              disabled={isLoading}
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full
                           hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Clear search"
              >
                <svg
                  className="w-5 h-5 text-gray-500 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            {!searchQuery && (
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading ownership data...</p>
          </div>
        ) : searchQuery.trim() ? (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400">
                {currentItems.length} result{currentItems.length !== 1 ? "s" : ""} found for &ldquo;{searchQuery}&rdquo;
              </p>
              {currentItems.length > 0 && (
                <button
                  onClick={() => handleSearch("")}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>

            {searchMode === "company" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(paginatedItems as Company[]).map((company) => (
                  <Link key={company.ticker} href={`/company/${company.ticker}`}>
                    <div
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700
                                 p-5 cursor-pointer hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500
                                 transition-all duration-200 transform hover:-translate-y-0.5 h-full"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-block px-2.5 py-1 text-sm font-bold text-blue-600 dark:text-blue-400
                                           bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              {company.ticker}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {highlightText(company.company)}
                          </h3>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2 mt-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-3">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Top Shareholders
                        </p>
                        <div className="space-y-2">
                          {company.shareholders.slice(0, 3).map((shareholder, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-gray-700 dark:text-gray-300 truncate flex-1 mr-2">
                                {highlightText(shareholder.name)}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap font-medium">
                                {shareholder.percent.toFixed(2)}%
                              </span>
                            </div>
                          ))}
                          {company.shareholders.length > 3 && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">
                              +{company.shareholders.length - 3} more shareholders
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {company.shareholders.length} shareholders
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Total: {formatNumber(company.shareholders.reduce((sum, s) => sum + s.total_shares, 0))} shares
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(paginatedItems as Investor[]).map((investor) => (
                  <Link key={investor.name} href={`/investor/${encodeURIComponent(investor.name)}`}>
                    <div
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700
                                 p-5 cursor-pointer hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500
                                 transition-all duration-200 transform hover:-translate-y-0.5 h-full"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {highlightText(investor.name)}
                          </h3>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2 mt-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-3">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Portfolio Summary
                        </p>
                        <div className="space-y-2">
                          {investor.holdings.slice(0, 3).map((holding, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-gray-700 dark:text-gray-300 truncate flex-1 mr-2">
                                <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded mr-1">
                                  {holding.ticker}
                                </span>
                                {highlightText(holding.company)}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap font-medium">
                                {holding.percent.toFixed(2)}%
                              </span>
                            </div>
                          ))}
                          {investor.holdings.length > 3 && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">
                              +{investor.holdings.length - 3} more companies
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {investor.holdings.length} companies
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Total: {formatNumber(investor.holdings.reduce((sum, h) => sum + h.total_shares, 0))} shares
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {totalPages > 1 && renderPagination()}
          </div>
        ) : (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {searchMode === "company" ? "All Companies" : "All Investors"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Showing {paginatedItems.length} of {currentItems.length} results
                {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
              </p>
            </div>

            {searchMode === "company" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(paginatedItems as Company[]).map((company) => (
                  <Link key={company.ticker} href={`/company/${company.ticker}`}>
                    <div
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700
                                 p-5 cursor-pointer hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500
                                 transition-all duration-200 transform hover:-translate-y-0.5 h-full"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-block px-2.5 py-1 text-sm font-bold text-blue-600 dark:text-blue-400
                                           bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              {company.ticker}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {company.company}
                          </h3>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2 mt-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-3">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Top Shareholders
                        </p>
                        <div className="space-y-2">
                          {company.shareholders.slice(0, 3).map((shareholder, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-gray-700 dark:text-gray-300 truncate flex-1 mr-2">
                                {shareholder.name}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap font-medium">
                                {shareholder.percent.toFixed(2)}%
                              </span>
                            </div>
                          ))}
                          {company.shareholders.length > 3 && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">
                              +{company.shareholders.length - 3} more shareholders
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {company.shareholders.length} shareholders
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Total: {formatNumber(company.shareholders.reduce((sum, s) => sum + s.total_shares, 0))} shares
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(paginatedItems as Investor[]).map((investor) => (
                  <Link key={investor.name} href={`/investor/${encodeURIComponent(investor.name)}`}>
                    <div
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700
                                 p-5 cursor-pointer hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500
                                 transition-all duration-200 transform hover:-translate-y-0.5 h-full"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {investor.name}
                          </h3>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2 mt-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-3">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Portfolio Summary
                        </p>
                        <div className="space-y-2">
                          {investor.holdings.slice(0, 3).map((holding, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-gray-700 dark:text-gray-300 truncate flex-1 mr-2">
                                <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded mr-1">
                                  {holding.ticker}
                                </span>
                                {holding.company}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap font-medium">
                                {holding.percent.toFixed(2)}%
                              </span>
                            </div>
                          ))}
                          {investor.holdings.length > 3 && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">
                              +{investor.holdings.length - 3} more companies
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {investor.holdings.length} companies
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Total: {formatNumber(investor.holdings.reduce((sum, h) => sum + h.total_shares, 0))} shares
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {totalPages > 1 && renderPagination()}
          </div>
        )}
      </main>
    </div>
  );
}
