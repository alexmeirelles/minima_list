'use client';

import { useTodoStore } from '@/store/useTodoStore';
import { translations } from '@/lib/i18n';

export function useTranslations() {
  const language = useTodoStore((s) => s.language);
  return translations[language];
}
