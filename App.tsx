

import React, { useState, useCallback } from 'react';
import type { FertilizerRecommendation, FormData } from './types';
import { getFertilizerRecommendation } from './services/geminiService';
import FertilizerForm from './components/FertilizerForm';
import RecommendationDisplay from './components/RecommendationDisplay';

const LeafIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C7 2 4 7 4 11.5S7 21 12 21s8-3.5 8-9.5S17 2 12 2z" />
    </svg>
);

function App() {
    const [formData, setFormData] = useState<FormData>({
        cropType: '',
        soilQuality: 'Average',
        climate: 'Temperate',
        growthStage: 'Vegetative',
        nutrientDeficiencies: '',
    });
    const [recommendations, setRecommendations] = useState<FertilizerRecommendation[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        const { name, value } = target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const recs = await getFertilizerRecommendation(formData);
            setRecommendations(recs);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch recommendations');
            setRecommendations(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 p-6">
            <header className="max-w-3xl mx-auto mb-6 flex items-center gap-3">
                <LeafIcon className="w-10 h-10 text-green-600" />
                <h1 className="text-2xl font-semibold">Agri-Nourish AI</h1>
            </header>

            <main className="max-w-3xl mx-auto space-y-6">
                <FertilizerForm formData={formData} onFormChange={handleFormChange} onSubmit={handleSubmit} isLoading={isLoading} />
                <RecommendationDisplay recommendations={recommendations} isLoading={isLoading} error={error} />
            </main>
        </div>
    );
}

export default App;
```


````ts
// filepath: c:\Users\Prabhakar\.vscode\Agri-Nourish-AI\types.ts
export interface FormData {
    cropType: string;
    soilQuality: 'Poor' | 'Average' | 'Good';
    climate: 'Tropical' | 'Dry' | 'Temperate' | 'Continental';
    growthStage: 'Seedling' | 'Vegetative' | 'Flowering' | 'Fruiting';
    nutrientDeficiencies: string;
}

export interface FertilizerRecommendation {
    fertilizerName: string;
    applicationMethod: string;
    reasoning: string;
    precautions: string;
}
```


````ts
// filepath: c:\Users\Prabhakar\.vscode\Agri-Nourish-AI\services\geminiService.ts
import type { FormData, FertilizerRecommendation } from "../types";

/**
 * Lightweight service:
 * - If GEMINI_API_KEY is set, you can implement a real call here.
 * - For now this returns a simple heuristic result so the UI works without secrets.
 */
export async function getFertilizerRecommendation(
  formData: FormData
): Promise<FertilizerRecommendation[]> {
  const { nutrientDeficiencies } = formData;

  // Simple heuristic fallback
  const lower = (nutrientDeficiencies || '').toLowerCase();
  const results: FertilizerRecommendation[] = [];

  if (lower.includes('nitrogen')) {
    results.push({
      fertilizerName: 'Urea (46% N)',
      applicationMethod: 'Top-dress or band-apply during active vegetative growth; 50-100 kg/ha depending on crop and soil test.',
      reasoning: 'Provides fast-available nitrogen to correct deficiency symptoms like yellowing leaves and poor growth.',
      precautions: 'Avoid over-application; apply when soil moisture is adequate. Wear gloves and avoid contact with eyes.',
    });
  }

  if (lower.includes('phosphorus') || results.length === 0) {
    results.push({
      fertilizerName: 'Single Super Phosphate (SSP)',
      applicationMethod: 'Broadcast and incorporate into soil before sowing or as a side placement near roots.',
      reasoning: 'Supplies phosphorus for root development and early establishment; useful when phosphorus deficiency suspected.',
      precautions: 'Acidic soils can fix P; follow soil-test recommendations.',
    });
  }

  // Limit to two options
  return results.slice(0, 2);
}
```


````tsx
// filepath: c:\Users\Prabhakar\.vscode\Agri-Nourish-AI\components\FertilizerForm.tsx
import React from 'react';
import type { FormData } from '../types';

interface FertilizerFormProps {
    formData: FormData;
    onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
}

const FertilizerForm: React.FC<FertilizerFormProps> = ({ formData, onFormChange, onSubmit, isLoading }) => {
    return (
        <form onSubmit={onSubmit} className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-sm font-medium">Crop Type</label>
                    <input name="cropType" value={formData.cropType} onChange={onFormChange} className="mt-1 block w-full" placeholder="e.g., Maize" />
                </div>

                <div>
                    <label className="block text-sm font-medium">Soil Quality</label>
                    <select name="soilQuality" value={formData.soilQuality} onChange={onFormChange} className="mt-1 block w-full">
                        <option>Poor</option>
                        <option>Average</option>
                        <option>Good</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium">Climate</label>
                    <select name="climate" value={formData.climate} onChange={onFormChange} className="mt-1 block w-full">
                        <option>Tropical</option>
                        <option>Dry</option>
                        <option>Temperate</option>
                        <option>Continental</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium">Growth Stage</label>
                    <select name="growthStage" value={formData.growthStage} onChange={onFormChange} className="mt-1 block w-full">
                        <option>Seedling</option>
                        <option>Vegetative</option>
                        <option>Flowering</option>
                        <option>Fruiting</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium">Nutrient Deficiencies (describe)</label>
                    <input name="nutrientDeficiencies" value={formData.nutrientDeficiencies} onChange={onFormChange} className="mt-1 block w-full" placeholder="e.g., nitrogen deficiency" />
                </div>

                <div className="text-right">
                    <button type="submit" disabled={isLoading} className="px-4 py-2 bg-green-600 text-white rounded">
                        {isLoading ? 'Analyzing…' : 'Get Recommendation'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default FertilizerForm;
```


````tsx
// filepath: c:\Users\Prabhakar\.vscode\Agri-Nourish-AI\components\RecommendationDisplay.tsx
import React from 'react';
import type { FertilizerRecommendation } from '../types';

interface RecommendationDisplayProps {
    recommendations: FertilizerRecommendation[] | null;
    isLoading: boolean;
    error: string | null;
}

const RecommendationCard: React.FC<{ rec: FertilizerRecommendation }> = ({ rec }) => (
    <div className="bg-white rounded-xl shadow-md p-4 border">
        <h3 className="font-semibold">{rec.fertilizerName}</h3>
        <p className="text-sm"><strong>Method:</strong> {rec.applicationMethod}</p>
        <p className="text-sm"><strong>Why:</strong> {rec.reasoning}</p>
        <p className="text-sm text-red-600"><strong>Precautions:</strong> {rec.precautions}</p>
    </div>
);

const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({ recommendations, isLoading, error }) => {
    if (isLoading) {
        return <div className="space-y-4"><div className="h-20 bg-white rounded animate-pulse" /></div>;
    }

    if (error) {
        return <div className="text-red-600">{error}</div>;
    }

    if (!recommendations || recommendations.length === 0) {
        return <div className="text-stone-600">No recommendations yet. Fill the form and submit.</div>;
    }

    return (
        <div className="grid gap-4">
            {recommendations.map((r, i) => <RecommendationCard key={i} rec={r} />)}
        </div>
    );
};

export default RecommendationDisplay;
```


````tsx
// filepath: c:\Users\Prabhakar\.vscode\Agri-Nourish-AI\index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```


````html
// filepath: c:\Users\Prabhakar\.vscode\Agri-Nourish-AI\index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
    <title>Agri-Nourish AI</title>
    <link rel="stylesheet" href="/index.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
```


````json
// filepath: c:\Users\Prabhakar\.vscode\Agri-Nourish-AI\package.json
{
  "name": "agri-nourish-ai",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@google/genai": "^1.25.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```


````ts
// filepath: c:\Users\Prabhakar\.vscode\Agri-Nourish-AI\vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
    server: {
      port: Number(env.VITE_PORT) || 3000,
    },
  };
});
```


````json
// filepath: c:\Users\Prabhakar\.vscode\Agri-Nourish-AI\tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "ES2020"],
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["./**/*.ts", "./**/*.tsx"]
}
```


````text
// filepath: c:\Users\Prabhakar\.vscode\Agri-Nourish-AI\.env.local
GEMINI_API_KEY=PLACEHOLDER_API_KEY
```


````text
// filepath: c:\Users\Prabhakar\.vscode\Agri-Nourish-AI\.gitignore
# Logs
logs
*.log

node_modules
dist
*.local

# Editor
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
```


````md
// filepath: c:\Users\Prabhakar\.vscode\Agri-Nourish-AI\README.md
# Agri-Nourish AI

Simple local scaffold for the Agri-Nourish AI app.

Run:
1. npm install
2. Set GEMINI_API_KEY in .env.local if you will call Gemini
3. npm run dev
```


PowerShell: create files and ensure writable (run from project root)
````powershell
# cd to project folder first
cd 'C:\Users\Prabhakar\.vscode\Agri-Nourish-AI'

# Ensure directories
New-Item -ItemType Directory -Force -Path services,components

# Example: write App.tsx (repeat for each file or paste the file contents into your editor)
@'
import React, { useState, useCallback } from 'react';
...
'@ | Set-Content -Path .\App.tsx -Encoding utf8

# Make all files writable (remove read-only attribute)
Get-ChildItem -Recurse | ForEach-Object { attrib -R $_.FullName }