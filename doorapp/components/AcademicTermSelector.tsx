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
    <div className="flex items-center justify-center gap-6 px-6 py-5">
      {/* Title */}
      <h1 className="text-black text-xl font-bold">
        📖 Select Academic Term
      </h1>

      {/* Dropdown */}
      <select
        id="term-selector"
        value={JSON.stringify(selectedTerm)}
        onChange={(e) => onTermChange(JSON.parse(e.target.value))}
        className="px-5 py-2 rounded-lg bg-pastel-blue text-black font-medium shadow-md hover:bg-pastel-green transition-all focus:outline-none focus:ring-4 focus:ring-pastel-pink/50 cursor-pointer border-2 border-black"
      >
        {terms.map((term) => (
          <option key={`${term.academicYear}-${term.semester}`} value={JSON.stringify(term)}>
            AY{term.academicYear} Semester {term.semester}
          </option>
        ))}
      </select>
    </div>
  );
}
