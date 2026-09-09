import projectsData from '@/data/projects.json';

export interface Project {
  slug: string;
  number: string;
  title: string;
  category: string;
  cover: string;
  images: string[];
  metadata: {
    platform: string;
    category: string;
    designer: string;
    tools: string[];
  };
  description: string;
  behanceUrl: string | null;
  githubUrl: string | null;
}

export interface GitHubProject {
  number: string;
  title: string;
  description: string;
  githubUrl: string;
  demoUrl: string | null;
}

export function getAllProjects(): Project[] {
  return projectsData.projects;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projectsData.projects.find(p => p.slug === slug);
}

export function getAllProjectSlugs(): string[] {
  return projectsData.projects.map(p => p.slug);
}

export function getGitHubProjects(): GitHubProject[] {
  return projectsData.githubProjects;
}

export function getFeaturedProjects(count: number = 4): Project[] {
  return projectsData.projects.slice(0, count);
}
