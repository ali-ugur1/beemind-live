// ── Turkish stop words ────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  "ne","bu","bir","ve","ile","da","de","ki","mi","mu","mı","mü","için","var",
  "yok","gibi","kadar","daha","çok","az","neden","nedir","neler","hangi","olan",
  "olur","oldu","eder","ediyor","etmek","ben","sen","biz","siz","o","bu","şu",
  "her","hiç","bile","ama","veya","ya","hem","çünkü","eğer","ancak","fakat",
  "the","is","are","how","what","does","do","can","for","to","of","in","on",
  "at","a","an","and","or","but","with","from","that","this","it","be","was",
  "nasıl","hangi","nerede","ne zaman","when","where","which",
]);

// ── Turkish suffix stripping (rule-based) ─────────────────────────────────────
const TR_SUFFIXES = [
  "ından","inden","undan","ünden","ndan","nden",
  "ında","inde","unda","ünde","nda","nde",
  "ına","ine","una","üne","na","ne",
  "ının","inin","unun","ünün","nın","nin","nun","nün",
  "ları","leri","lar","ler",
  "ıyla","iyle","uyla","üyle",
  "ıdan","iden",
  "dan","den","tan","ten",
  "daki","deki","taki","teki",
  "ıdır","idir","udur","üdür",
  "dır","dir","dur","dür","tır","tir","tur","tür",
  "ımı","imi","umu","ümü",
  "mı","mi","mu","mü",
  "ını","ini","unu","ünü",
  "lık","lik","luk","lük",
  "cı","ci","cu","cü","çı","çi","çu","çü",
  "sal","sel",
  "sı","si","su","sü",
  "ı","i","u","ü","a","e",
];

export function stem(word) {
  if (word.length <= 3) return word;
  for (const suffix of TR_SUFFIXES) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
      return word.slice(0, word.length - suffix.length);
    }
  }
  return word;
}

// ── Tokenize + normalize ──────────────────────────────────────────────────────
export function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function stemTokens(tokens) {
  return tokens.map(stem);
}

// ── Bigrams ───────────────────────────────────────────────────────────────────
function bigrams(tokens) {
  const result = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    result.push(tokens[i] + "_" + tokens[i + 1]);
  }
  return result;
}

// ── Main search function ──────────────────────────────────────────────────────
export function searchKnowledge(query, lang = "tr", knowledge) {
  const rawTokens = tokenize(query);
  if (rawTokens.length === 0) return { best: null, related: [] };

  const stemmed = stemTokens(rawTokens);
  const qBigrams = bigrams(rawTokens);

  const scored = knowledge.map((entry) => {
    let score = 0;
    const kwStemmed = entry.keywords.map(stem);
    const questionText = (lang === "tr" ? entry.question_tr : entry.question_en).toLowerCase();
    const answerText = (lang === "tr" ? entry.answer_tr : entry.answer_en).toLowerCase();
    const questionTokens = stemTokens(tokenize(questionText));
    const answerTokensStem = stemTokens(tokenize(answerText));

    // 1) Keyword exact match (highest weight)
    for (const raw of rawTokens) {
      if (entry.keywords.includes(raw)) score += 20;
    }

    // 2) Stemmed keyword match
    for (const s of stemmed) {
      for (const kws of kwStemmed) {
        if (kws === s) score += 14;
        else if (kws.startsWith(s) && s.length >= 4) score += 8;
        else if (s.startsWith(kws) && kws.length >= 4) score += 6;
      }
    }

    // 3) Bigram match
    for (const bg of qBigrams) {
      const [a, b] = bg.split("_");
      if (entry.keywords.includes(a) && entry.keywords.includes(b)) score += 12;
    }

    // 4) Question title match
    for (const s of stemmed) {
      if (questionTokens.includes(s)) score += 6;
    }
    for (const raw of rawTokens) {
      if (questionText.includes(raw)) score += 4;
    }

    // 5) Answer content match (low weight)
    for (const s of stemmed) {
      if (answerTokensStem.includes(s)) score += 1;
    }

    // 6) Bonus: single strong keyword
    if (rawTokens.length === 1 && score >= 14) score += 5;

    return { entry, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const MIN_SCORE = 10;
  const best = scored[0]?.score >= MIN_SCORE ? scored[0].entry : null;
  const related = scored
    .slice(1, 4)
    .filter((s) => s.score >= MIN_SCORE && s.entry !== best)
    .map((s) => s.entry);

  return { best, related, topScore: scored[0]?.score ?? 0 };
}
