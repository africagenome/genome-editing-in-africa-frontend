export const mockDatabase = [
  { country: "South Africa", organism: "Maize", trait: "drought tolerance", project: "CRISPR-maize" },
  { country: "Kenya", organism: "Cowpea", trait: "pod borer resistance", project: "Gene edited cowpea" },
  { country: "Nigeria", organism: "Cassava", trait: "mosaic virus", project: "VIRCA Plus" },
  { country: "Egypt", organism: "Wheat", trait: "salt tolerance", project: "Salt-tolerant wheat" },
  { country: "Rwanda", organism: "Banana", trait: "bacterial wilt resistance", project: "Banana21" }
];

export const readinessData = {
  "South Africa": 0.85, "Kenya": 0.78, "Nigeria": 0.62, "Ghana": 0.71, 
  "Egypt": 0.74, "Morocco": 0.70, "Rwanda": 0.69, "Ethiopia": 0.55, 
  "Senegal": 0.65, "Zambia": 0.48, "Botswana": 0.73, "Tanzania": 0.57, 
  "Uganda": 0.58, "Côte d'Ivoire": 0.59
};

export const chartData = {
  labels: ['Agriculture & Food', 'Human Health', 'Environmental', 'Regulatory', 'Capacity Building'],
  datasets: [22, 14, 6, 8, 17],
  colors: ['#5B7E96', '#B4A269', '#6C9EBF', '#D4A373', '#4F7C6B']
};