import type { Metadata } from "next";
import { LandingHomeExperience } from "@/components/home/LandingHomeExperience";

const title = "Jengrac Education Foundation | AI, XR and Spatial Intelligence for Education and Institutional Transformation";
const description =
  "Jengrac Education Foundation builds Artificial Intelligence, Extended Reality and Spatial Intelligence systems for education, skills development, institutional transformation and practical capability.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.jengrac.tech"),
  title,
  description,
  alternates: {
    canonical: "https://www.jengrac.tech/"
  },
  openGraph: {
    title,
    description,
    url: "https://www.jengrac.tech/",
    siteName: "Jengrac Education Foundation",
    images: [
      {
        url: "/images/xr/jef-xr-expo-headset-demo.jpeg",
        width: 1280,
        height: 720,
        alt: "Jengrac Education Foundation XR demonstration"
      }
    ],
    locale: "en_ZA",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/xr/jef-xr-expo-headset-demo.jpeg"]
  }
};

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Jengrac Education Foundation",
    url: "https://www.jengrac.tech/",
    email: "admin@jengrac.tech",
    description,
    knowsAbout: [
      "Artificial Intelligence",
      "Extended Reality",
      "Spatial Intelligence",
      "Education technology",
      "Skills development",
      "Institutional transformation"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LandingHomeExperience />
    </>
  );
}
