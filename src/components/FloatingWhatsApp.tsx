'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FloatingWhatsApp() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER!;
  const message = encodeURIComponent("Hi! I'm interested in your academic projects. Can you help me?");

  return (
    <Button
      onClick={() => window.open(`https://wa.me/91${whatsappNumber}?text=${message}`, '_blank')}
      className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-40"
      title="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </Button>
  );
}
