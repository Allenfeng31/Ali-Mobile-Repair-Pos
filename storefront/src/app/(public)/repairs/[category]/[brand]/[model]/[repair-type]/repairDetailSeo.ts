import type { Metadata } from 'next';

type RepairDetailSeoInput = {
  title: string;
  description: string;
  canonicalUrl: string;
  model: string;
  repairName: string;
};

export function getRepairDetailHeading(model: string, repairName: string) {
  return `${model} ${repairName}`;
}

export function buildRepairDetailSeo({
  title,
  description,
  canonicalUrl,
  model,
  repairName,
}: RepairDetailSeoInput): Metadata {
  const socialTitle = `${getRepairDetailHeading(model, repairName)} | Ali Mobile & Repair`;

  return {
    title,
    description,
    openGraph: {
      title: socialTitle,
      description,
      url: canonicalUrl,
    },
    twitter: {
      title: socialTitle,
      description,
    },
  };
}
