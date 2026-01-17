'use client';

import { AcademicTerm } from '@/types/door';

interface AcademicTermSelectorProps {
  terms: AcademicTerm[];
  selectedTerm: AcademicTerm;
  onTermChange: (term: AcademicTerm) => void;
}

export default function AcademicTermSelector({
  terms,
  selectedTerm,
  onTermChange,
}: AcademicTermSelectorProps) {
  return (
    <div className="fixed top-0 left-20 right-0 z-30 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 shadow-lg border-b-4 border-amber-950">
      <div className="flex items-center justify-center gap-6 px-6 py-4">
        {/* Title */}
        <h1 className="text-amber-50 text-2xl font-bold drop-shadow-md sketch-title">
          📖 Door Gallery
        </h1>

        {/* Dropdown */}
        <div className="flex items-center gap-3">
          <label htmlFor="term-selector" className="text-amber-50 font-semibold text-sm sketch-text">
            Academic Term:
          </label>
          <select
            id="term-selector"
            value={JSON.stringify(selectedTerm)}
            onChange={(e) => onTermChange(JSON.parse(e.target.value))}
            className="px-4 py-2 rounded-md bg-amber-50 text-amber-900 font-semibold shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-4 focus:ring-amber-950/50 cursor-pointer border-2 border-amber-900/20"
          >
            {terms.map((term) => (
              <option key={`${term.academicYear}-${term.semester}`} value={JSON.stringify(term)}>
                AY{term.academicYear} Semester {term.semester}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
