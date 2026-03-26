import { IdeaValidationProvider } from './_context/IdeaValidationContext';

export const metadata = {
  title: 'Idea Validation & Market Analysis | OnEasy AI',
  description:
    'Validate your business idea with AI-powered market analysis, competitor mapping, and investor-ready reports.',
};

export default function IdeaValidationLayout({ children }: { children: React.ReactNode }) {
  return <IdeaValidationProvider>{children}</IdeaValidationProvider>;
}
