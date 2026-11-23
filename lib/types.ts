export type Project = { id: string; title: string; category: string; description: string; year: string; image: string; };
export type Profile = {
  name: string; role: string; location: string; country: string; bio: string;
  email: string; website: string; accent: string; template: string; slug: string;
  skills: string[]; projects: Project[];
};
export const starterProfile: Profile = {
  name: "Alex Morgan", role: "Multidisciplinary Designer", location: "Bengaluru, India",
  country: "India", bio: "I turn complex ideas into thoughtful visual experiences. My practice moves across identity, digital products and storytelling.",
  email: "hello@example.com", website: "alexmorgan.design", accent: "#b7f06b",
  template: "atelier", slug: "alex-morgan",
  skills: ["Art Direction", "Visual Identity", "UI/UX", "Photography", "Motion Design"],
  projects: [
    { id: "p1", title: "A quieter kind of city", category: "Editorial · Photography", description: "A visual study of everyday rituals and overlooked urban spaces.", year: "2025", image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1000&q=85" },
    { id: "p2", title: "Common Ground", category: "Brand Identity", description: "A flexible identity system for a community-led cultural space.", year: "2024", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1000&q=85" },
    { id: "p3", title: "Objects in motion", category: "Digital Experience", description: "An expressive digital catalogue exploring form, material and movement.", year: "2024", image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1000&q=85" }
  ]
};
