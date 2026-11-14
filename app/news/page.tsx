"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase (Make sure to use your actual keys here if not using env vars)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";
const supabase = createClient(supabaseUrl, supabaseKey);

type NewsArticle = {
  id: number;
  title: string;
  link: string;
  source: string;
  description: string;
  image_url: string | null;
  created_at: string;
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1000";

export default function MarketNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const { data, error } = await supabase
          .from("market_news")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;
        if (data) setArticles(data);
      } catch (err) {
        console.error("Error fetching news:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
    // Refresh every 60 seconds
    const interval = setInterval(fetchNews, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center">
        <p className="text-green-500 animate-pulse text-xl">Loading Market News...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center">
        <p>No news articles found. Please check back later.</p>
      </div>
    );
  }

  const heroArticle = articles[0];
  const gridArticles = articles.slice(1);

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen bg-[#0B1120] text-white">
      {/* Header & Categories */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Market News</h1>
        <p className="text-gray-400 mb-6">Latest updates from the world of finance</p>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {["All", "Markets", "Economy", "Companies", "Global"].map((cat) => (
            <button 
              key={cat}
              className="bg-gray-800/50 border border-gray-700 hover:bg-gray-700 transition-colors rounded-full px-4 py-1 text-sm whitespace-nowrap"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Article */}
      <div 
        onClick={() => window.open(heroArticle.link, "_blank")}
        className="flex flex-col md:flex-row gap-6 bg-[#111827] border border-gray-800 rounded-xl overflow-hidden shadow-lg cursor-pointer hover:border-green-500/50 transition-all group"
      >
        <img 
          src={heroArticle.image_url || FALLBACK_IMAGE} 
          alt={heroArticle.title}
          className="w-full md:w-1/2 h-[300px] md:h-auto object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="p-6 md:p-8 flex flex-col justify-center md:w-1/2">
          <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded w-fit mb-4">
            {heroArticle.source || "News"}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight group-hover:text-green-400 transition-colors">
            {heroArticle.title}
          </h2>
          <p className="text-gray-400 text-sm mb-6 line-clamp-3">
            {heroArticle.description}
          </p>
          <span className="text-xs text-gray-500">
            {new Date(heroArticle.created_at).toLocaleString()}
          </span>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {gridArticles.map((article) => (
          <div 
            key={article.id}
            onClick={() => window.open(article.link, "_blank")}
            className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:border-green-500/50 transition-all flex flex-col group"
          >
            <div className="h-48 overflow-hidden">
              <img 
                src={article.image_url || FALLBACK_IMAGE} 
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded w-fit mb-2">
                {article.source || "News"}
              </span>
              <h3 className="text-md font-bold mb-2 line-clamp-2 group-hover:text-green-400 transition-colors">
                {article.title}
              </h3>
              <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(article.created_at).toLocaleDateString()}</span>
                <span className="text-green-500">Read →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}