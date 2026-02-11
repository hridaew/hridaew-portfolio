export interface SideProject {
    title: string;
    description: string;
    year: string;
    link?: string;
    image?: string;
}

export const sideProjects: SideProject[] = [
    {
        title: "Art Block",
        description: "A generative art experiment exploring color and form.",
        year: "2024",
        link: "#",
        image: "/images/placeholder-art.jpg",
    },
    {
        title: "Focus Dial",
        description: "A minimal productivity timer for deep work sessions.",
        year: "2023",
        link: "#",
        image: "/images/placeholder-focus.jpg",
    },
    {
        title: "Type Scale Calculator",
        description: "A tool for designers to generate harmonious typography scales.",
        year: "2022",
        link: "#",
        image: "/images/placeholder-type.jpg",
    },
];
