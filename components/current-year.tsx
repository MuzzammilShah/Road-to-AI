'use client';
import { useEffect, useState } from 'react';

const buildYear = new Date().getFullYear();

/**
 * The current year. The static export holds the year of the build; the browser then swaps in its
 * own year, so the copyright stays current even if the site isn't rebuilt for a while.
 */
export function CurrentYear() {
  const [year, setYear] = useState(buildYear);
  useEffect(() => setYear(new Date().getFullYear()), []);
  return <>{year}</>;
}
