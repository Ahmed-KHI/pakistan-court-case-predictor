/**
 * Pakistan Legal Knowledge Base
 * 
 * This file contains structured information about Pakistani law
 * In production, this would be replaced with a vector database (Pinecone/Chroma)
 */

import { LegalDocument } from "@/types";

export const pakistanLegalDatabase: LegalDocument[] = [
  {
    id: "PPC-302",
    title: "Pakistan Penal Code - Section 302 (Murder)",
    type: "statute",
    content: `Section 302: Punishment for murder (Qatl-e-amd)
    
Whoever commits qatl-e-amd shall, subject to the provisions of this Chapter be:
(a) punished with death as qisas;
(b) punished with death or imprisonment for life as ta'zir having regard to the facts and circumstances of the case, if the proof in either of the forms specified in section 304 is not available; or
(c) punished with imprisonment of either description for a term which may extend to twenty-five years where according to the injunctions of Islam the punishment of qisas is not applicable.

Key aspects:
- Qatl-e-amd means intentional murder
- Qisas refers to retaliatory punishment
- Ta'zir refers to discretionary punishment
- Requires proof beyond reasonable doubt
- Heirs can grant pardon (diyat)`,
    sections: ["302", "302-a", "302-b"],
    keywords: ["murder", "qatl", "death penalty", "qisas", "tazir", "homicide"],
  },
  {
    id: "PPC-379",
    title: "Pakistan Penal Code - Section 379 (Theft)",
    type: "statute",
    content: `Section 379: Punishment for theft

Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.

Key aspects:
- Theft is dishonestly taking moveable property
- Maximum punishment: 3 years imprisonment
- Can include fine
- Intent to permanently deprive owner required
- Different from robbery (which involves force)`,
    sections: ["379", "378"],
    keywords: ["theft", "stealing", "larceny", "property crime"],
  },
  {
    id: "PPC-420",
    title: "Pakistan Penal Code - Section 420 (Cheating)",
    type: "statute",
    content: `Section 420: Cheating and dishonestly inducing delivery of property

Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.

Key aspects:
- Involves deception and fraud
- Maximum punishment: 7 years imprisonment plus fine
- Must result in delivery of property or alteration of documents
- Commonly used for fraud cases
- Includes online fraud, financial scams`,
    sections: ["420", "415"],
    keywords: ["cheating", "fraud", "deception", "scam", "dishonesty"],
  },
  {
    id: "CONST-9",
    title: "Constitution of Pakistan - Article 9 (Security of Person)",
    type: "constitution",
    content: `Article 9: Security of person

No person shall be deprived of life or liberty save in accordance with law.

Key aspects:
- Fundamental right to life and liberty
- Can only be restricted by law
- Basis for habeas corpus petitions
- Protects against arbitrary detention
- Supreme Court has expanded interpretation to include right to dignified life`,
    sections: ["Article 9"],
    keywords: ["fundamental rights", "life", "liberty", "security", "detention"],
  },
  {
    id: "CONST-10",
    title: "Constitution of Pakistan - Article 10 (Safeguards as to arrest)",
    type: "constitution",
    content: `Article 10: Safeguards as to arrest and detention

(1) No person who is arrested shall be detained in custody without being informed, as soon as may be, of the grounds for such arrest, nor shall he be denied the right to consult and be defended by a legal practitioner of his choice.

(2) Every person who is arrested and detained in custody shall be produced before a magistrate within a period of twenty-four hours of such arrest, excluding the time of journey from the place of arrest to the court of the magistrate, and no such person shall be detained in custody beyond the said period without the authority of a magistrate.

Key aspects:
- Right to know grounds of arrest
- Right to lawyer
- Must be produced before magistrate within 24 hours
- Protection against illegal detention
- Habeas corpus remedy available`,
    sections: ["Article 10", "Article 10A"],
    keywords: ["arrest", "detention", "rights", "lawyer", "magistrate"],
  },
  {
    id: "CRPC-154",
    title: "Code of Criminal Procedure - Section 154 (FIR)",
    type: "statute",
    content: `Section 154: Information in cognizable cases

(1) Every information relating to the commission of a cognizable offence, if given orally to an officer in charge of a police station, shall be reduced to writing by him or under his direction, and be read over to the informant; and every such information, whether given in writing or reduced to writing as aforesaid, shall be signed by the person giving it, and the substance thereof shall be entered in a book to be kept by such officer in such form as the Provincial Government may prescribe in this behalf.

Key aspects:
- First Information Report (FIR) is the starting point of criminal investigation
- Must be registered for cognizable offences
- Cannot be refused by police
- Copy must be provided to informant free of cost
- Critical for establishing timeline and facts
- Delay in FIR can affect case credibility`,
    sections: ["154", "154-A"],
    keywords: ["FIR", "police report", "complaint", "cognizable offence"],
  },
  {
    id: "CPC-ORDER-39",
    title: "Code of Civil Procedure - Order 39 (Injunctions)",
    type: "statute",
    content: `Order 39: Temporary Injunctions and Interlocutory Orders

Rule 1: Cases in which temporary injunction may be granted
Where in any suit it is proved by affidavit or otherwise:
(a) that any property in dispute in a suit is in danger of being wasted, damaged or alienated by any party to the suit, or wrongfully sold in execution of a decree, or
(b) that the defendant threatens, or intends to remove or dispose of his property with a view to defrauding his creditors, or
(c) that the defendant threatens to dispossess the plaintiff or otherwise cause injury to the plaintiff in relation to any property in dispute in the suit,

the Court may by order grant a temporary injunction to restrain such act, or make such other order for the purpose of staying and preventing the wasting, damaging, alienation, sale, removal or disposition of the property as the Court thinks fit, until the disposal of the suit or until further orders.

Key aspects:
- Temporary relief before final judgment
- Requires prima facie case
- Balance of convenience must favor applicant
- Irreparable loss if injunction not granted
- Common in property disputes
- Can be granted ex-parte in urgent cases`,
    sections: ["Order 39 Rule 1", "Order 39 Rule 2"],
    keywords: ["injunction", "temporary relief", "stay order", "property dispute"],
  },
];

// Helper function to search legal database
export function searchLegalDatabase(query: string): LegalDocument[] {
  const lowerQuery = query.toLowerCase();
  
  return pakistanLegalDatabase.filter(doc => 
    doc.keywords.some(keyword => lowerQuery.includes(keyword.toLowerCase())) ||
    doc.title.toLowerCase().includes(lowerQuery) ||
    doc.content.toLowerCase().includes(lowerQuery)
  );
}

// Get relevant laws based on case type
export function getRelevantLawsByCaseType(caseType: string): LegalDocument[] {
  const typeKeywords: Record<string, string[]> = {
    criminal: ["murder", "theft", "fraud", "assault", "qatl", "cheating"],
    civil: ["injunction", "property", "contract", "damages"],
    property: ["property", "possession", "title", "injunction"],
    family: ["divorce", "custody", "maintenance", "inheritance"],
    constitutional: ["fundamental rights", "life", "liberty", "security"],
  };

  const keywords = typeKeywords[caseType.toLowerCase()] || [];
  
  return pakistanLegalDatabase.filter(doc =>
    keywords.some(keyword => 
      doc.keywords.some(docKeyword => 
        docKeyword.toLowerCase().includes(keyword.toLowerCase())
      )
    )
  );
}

// Sample case precedents
export const pakistanCasePrecedents = [
  {
    id: "SC-2005-1",
    title: "Ghulam Mustafa vs State (2005)",
    court: "Supreme Court of Pakistan",
    year: 2005,
    caseType: "criminal",
    outcome: "Conviction upheld",
    summary: "Murder case where eyewitness testimony was corroborated by medical evidence. Court emphasized the importance of consistent witness statements.",
    relevantLaws: ["PPC-302"],
  },
  {
    id: "LHC-2010-45",
    title: "Mst. Sughran vs State (2010)",
    court: "Lahore High Court",
    year: 2010,
    caseType: "criminal",
    outcome: "Acquitted",
    summary: "Murder case where prosecution failed to prove motive and evidence was circumstantial. Court acquitted citing benefit of doubt.",
    relevantLaws: ["PPC-302", "Qanun-e-Shahadat"],
  },
  {
    id: "SC-2018-23",
    title: "Muhammad Arif vs Federation of Pakistan (2018)",
    court: "Supreme Court of Pakistan",
    year: 2018,
    caseType: "constitutional",
    outcome: "Petition allowed",
    summary: "Habeas corpus petition. Court held that detention beyond 24 hours without magistrate order violates Article 10 of Constitution.",
    relevantLaws: ["Constitution Article 10", "CrPC-154"],
  },
];

// Get context for Gemini API
export function buildLegalContext(caseType: string, description: string): string {
  const relevantLaws = getRelevantLawsByCaseType(caseType);
  const searchResults = searchLegalDatabase(description);
  
  const allRelevantDocs = [...new Set([...relevantLaws, ...searchResults])];
  
  let context = "RELEVANT PAKISTANI LAWS:\n\n";
  
  allRelevantDocs.slice(0, 5).forEach(doc => {
    context += `${doc.title}\n${doc.content}\n\n---\n\n`;
  });
  
  return context;
}
