'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Topic } from '@/lib/topics/types';
import { Baby, MessageSquare, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';

interface TopicLandingPageProps {
  topic: Topic;
  relatedTopics: Topic[];
}

export function TopicLandingPage({ topic, relatedTopics }: TopicLandingPageProps) {
  const [selectedLevel, setSelectedLevel] = useState<'5yo' | 'normal' | 'advanced'>('normal');

  const explanation = topic.explanations[selectedLevel];

  const levelConfig = {
    '5yo': {
      icon: Baby,
      label: '5-Year-Old',
      color: 'from-pink-500 to-rose-500',
      bg: 'from-pink-50 to-rose-50',
      border: 'border-pink-200',
      description: 'Super simple, like explaining to a child'
    },
    normal: {
      icon: MessageSquare,
      label: 'Normal',
      color: 'from-blue-500 to-indigo-500',
      bg: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      description: 'Clear and accessible for everyone'
    },
    advanced: {
      icon: GraduationCap,
      label: 'Advanced',
      color: 'from-purple-500 to-violet-500',
      bg: 'from-purple-50 to-violet-50',
      border: 'border-purple-200',
      description: 'Technical and comprehensive'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Stupify
            </span>
          </Link>
          
          <Link 
            href="/chat"
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
          >
            Try for Free
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/explain" className="hover:text-indigo-600">Explain</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{topic.title}</span>
        </nav>

        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            What is {topic.title}?
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Finally explained in plain English
          </p>
          
          {/* Category & Difficulty Badge */}
          <div className="flex items-center justify-center gap-3 text-sm">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
              {topic.category}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
              {topic.difficulty}
            </span>
          </div>
        </div>

        {/* Level Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Choose your explanation level:
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.keys(levelConfig) as Array<'5yo' | 'normal' | 'advanced'>).map((level) => {
              const config = levelConfig[level];
              const Icon = config.icon;
              const isSelected = selectedLevel === level;
              
              return (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? `bg-gradient-to-br ${config.bg} ${config.border} shadow-lg scale-105`
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">{config.label}</span>
                  </div>
                  <p className="text-sm text-gray-600 text-left">
                    {config.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Explanation Card */}
        <div className={`p-8 rounded-2xl bg-gradient-to-br ${levelConfig[selectedLevel].bg} border ${levelConfig[selectedLevel].border} mb-8`}>
          <div className="flex items-center gap-2 mb-4">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${levelConfig[selectedLevel].color}`}>
              {(() => {
                const Icon = levelConfig[selectedLevel].icon;
                return <Icon className="w-5 h-5 text-white" />;
              })()}
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {levelConfig[selectedLevel].label} Explanation
            </h3>
          </div>
          
          <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-line">
            {explanation}
          </p>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-8 text-center text-white mb-12">
          <h2 className="text-2xl font-bold mb-3">
            Want to learn more about {topic.title}?
          </h2>
          <p className="text-indigo-100 mb-6">
            Ask Stupify your own questions and get instant, simple answers
          </p>
          <Link 
            href="/chat"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-all"
          >
            Start Learning for Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Related Topics */}
        {relatedTopics.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Related Topics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedTopics.map((relatedTopic) => (
                <Link
                  key={relatedTopic.slug}
                  href={`/explain/${relatedTopic.slug}`}
                  className="p-6 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {relatedTopic.title}
                    </h3>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {relatedTopic.metaDescription.substring(0, 100)}...
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                      {relatedTopic.category}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                      {relatedTopic.difficulty}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white mt-20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center text-gray-600 text-sm">
            <p className="mb-2">
              © 2025 Stupify. Making AI accessible to everyone.
            </p>
            <p>
              <Link href="/about" className="hover:text-indigo-600">About</Link>
              <span className="mx-2">•</span>
              <Link href="/privacy" className="hover:text-indigo-600">Privacy</Link>
              <span className="mx-2">•</span>
              <Link href="/terms" className="hover:text-indigo-600">Terms</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}