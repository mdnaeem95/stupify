'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShareableCard } from './ShareableCard';
import { downloadCardImage, shareCardImage } from '@/lib/card-generator';
import { Download, Share2, Copy, Check, Loader2, X } from 'lucide-react';
import { SimplicityLevel } from '@/lib/prompts/prompts-v2';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  answer: string;
  level: SimplicityLevel;
  explanationId?: string;
}

export function ShareModal({
  isOpen,
  onClose,
  question,
  answer,
  level,
  explanationId,
}: ShareModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    setIsDownloading(true);
    try {
      const success = await downloadCardImage(cardRef.current, 'stupify-explanation');
      if (!success) {
        alert('Failed to download image. Please try again.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    
    setIsSharing(true);
    try {
      // Track share event
      if (explanationId) {
        await fetch('/api/share/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ explanationId }),
        });
      }

      // Share or download
      const success = await shareCardImage(cardRef.current, { question, answer });
      if (!success) {
        alert('Failed to share. Image has been downloaded instead!');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!explanationId) return;
    
    const link = `${window.location.origin}/share/${explanationId}`;
    await navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const shareText = `Just learned something cool: "${question}"\n\nExplained simply by Stupify!\n${window.location.origin}`;

  const handleShareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleShareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Share Your Learning</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4"
          >
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Card Preview */}
          <div className="flex justify-center">
            <div ref={cardRef}>
              <ShareableCard
                question={question}
                answer={answer}
                level={level}
                theme="gradient"
                showBranding={true}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              variant="outline"
              className="w-full"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </>
              )}
            </Button>

            <Button
              onClick={handleShare}
              disabled={isSharing}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isSharing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Image
                </>
              )}
            </Button>
          </div>

          {/* Social Share Options */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Or share directly:</p>
            
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={handleShareToTwitter}
                variant="outline"
                className="w-full"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter
              </Button>

              <Button
                onClick={handleShareToLinkedIn}
                variant="outline"
                className="w-full"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </Button>

              {explanationId && (
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="w-full"
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-900">
              <strong>💡 Tip:</strong> Share your learning journey! Your friends will love seeing complex topics explained simply.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}