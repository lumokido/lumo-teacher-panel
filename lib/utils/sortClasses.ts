/**
 * Helper utility to sort school classes in natural grade order:
 * Nursery -> PP-1 -> PP-2 -> 1st/First Class -> 2nd/Second Class -> ... -> 12th/Twelfth Class
 */

export function getClassSortRank(className: string): number {
  if (!className) return 999;
  const name = className.toLowerCase().trim();

  // Playgroup / Play Group / Pre-Nursery
  if (
    name.includes("playgroup") ||
    name.includes("play group") ||
    name.includes("pre-nursery") ||
    name.includes("prenursery") ||
    /\bpg\b/i.test(name)
  ) {
    return 1;
  }

  // Nursery
  if (name.includes("nursery") || /\bnur\b/i.test(name)) {
    return 2;
  }

  // LKG / PP1 / PP-1
  if (/\b(lkg|lower\s*kg|l\.k\.g|pp-?1|pre-?primary\s*1)\b/i.test(name)) {
    return 3;
  }

  // UKG / PP2 / PP-2
  if (/\b(ukg|upper\s*kg|u\.k\.g|pp-?2|pre-?primary\s*2)\b/i.test(name)) {
    return 4;
  }

  // PP3 / PP-3
  if (/\b(pp-?3|pre-?primary\s*3)\b/i.test(name)) {
    return 5;
  }

  // Word ordinal mapping
  if (/\b(first|1st)\b/i.test(name) || name.includes("first")) return 11;
  if (/\b(second|2nd)\b/i.test(name) || name.includes("second")) return 12;
  if (/\b(third|3rd)\b/i.test(name) || name.includes("third")) return 13;
  if (/\b(fourth|4th)\b/i.test(name) || name.includes("fourth")) return 14;
  if (/\b(fifth|5th)\b/i.test(name) || name.includes("fifth")) return 15;
  if (/\b(sixth|6th)\b/i.test(name) || name.includes("sixth")) return 16;
  if (/\b(seventh|sevnth|7th)\b/i.test(name) || name.includes("seventh") || name.includes("sevnth")) return 17;
  if (/\b(eighth|8th)\b/i.test(name) || name.includes("eighth")) return 18;
  if (/\b(ninth|9th)\b/i.test(name) || name.includes("ninth")) return 19;
  if (/\b(tenth|10th)\b/i.test(name) || name.includes("tenth")) return 20;
  if (/\b(eleventh|11th)\b/i.test(name) || name.includes("eleventh")) return 21;
  if (/\b(twelfth|12th)\b/i.test(name) || name.includes("twelfth")) return 22;

  // Roman numerals (using word boundary checks)
  if (/\bxii\b/i.test(name)) return 22;
  if (/\bxi\b/i.test(name)) return 21;
  if (/\bx\b/i.test(name)) return 20;
  if (/\bix\b/i.test(name)) return 19;
  if (/\bviii\b/i.test(name)) return 18;
  if (/\bvii\b/i.test(name)) return 17;
  if (/\bvi\b/i.test(name)) return 16;
  if (/\bv\b/i.test(name)) return 15;
  if (/\biv\b/i.test(name)) return 14;
  if (/\biii\b/i.test(name)) return 13;
  if (/\bii\b/i.test(name)) return 12;
  if (/\bi\b/i.test(name)) return 11;

  // Digits extraction (e.g. "Class 1", "Class 2", "10th", "Grade 3")
  const match = name.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    if (!isNaN(num)) {
      return 10 + num;
    }
  }

  return 999;
}

export function sortClasses<T extends { name: string } | string>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];

  return [...items].sort((a, b) => {
    const nameA = typeof a === "string" ? a : a.name;
    const nameB = typeof b === "string" ? b : b.name;

    const rankA = getClassSortRank(nameA);
    const rankB = getClassSortRank(nameB);

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: "base" });
  });
}
