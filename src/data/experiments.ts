export interface ExperimentItem {
    type: "image" | "video";
    src: string;
    poster?: string;
    alt: string;
    caption?: string;
    aspect: "landscape" | "portrait" | "square";
}

// Placeholder items — replace with actual experiment content
export const experiments: ExperimentItem[] = [
    {
        type: "image",
        src: "",
        alt: "Experiment 1",
        caption: "Experiment",
        aspect: "landscape",
    },
    {
        type: "image",
        src: "",
        alt: "Experiment 2",
        caption: "Experiment",
        aspect: "portrait",
    },
    {
        type: "image",
        src: "",
        alt: "Experiment 3",
        caption: "Experiment",
        aspect: "square",
    },
    {
        type: "image",
        src: "",
        alt: "Experiment 4",
        caption: "Experiment",
        aspect: "landscape",
    },
    {
        type: "image",
        src: "",
        alt: "Experiment 5",
        caption: "Experiment",
        aspect: "portrait",
    },
    {
        type: "image",
        src: "",
        alt: "Experiment 6",
        caption: "Experiment",
        aspect: "square",
    },
];
