export type CatalogueCategory =
  | "XR and Spatial Computing"
  | "Computing Workstations"
  | "Mobile AR and Content Creation"
  | "Interactive Teaching"
  | "Power, Charging and Storage"
  | "Device Management";

export type PricingMode = "FIXED" | "REQUEST_QUOTE";

export type CatalogueProduct = {
  id: string;
  slug: string;
  name: string;
  model?: string;
  category: CatalogueCategory;
  subcategory?: string;
  summary: string;
  description?: string;
  image: string;
  imageAlt: string;
  specifications: Array<{ label: string; value: string }>;
  intendedUses: string[];
  capabilityTags: string[];
  productCode?: string;
  displayedPrice?: string;
  pricingMode: PricingMode;
  featured?: boolean;
  sourcePage: number;
};

export const xrCataloguePdf = {
  href: "/documents/jef-xr-lab-product-catalogue.pdf",
  bytes: 13433260,
  label: "Download XR Catalogue - PDF, approximately 13 MB"
};

export const catalogueCategories: CatalogueCategory[] = [
  "XR and Spatial Computing",
  "Computing Workstations",
  "Mobile AR and Content Creation",
  "Interactive Teaching",
  "Power, Charging and Storage",
  "Device Management"
];

export const intendedUseFilters = [
  "Student Learning",
  "Lecturer Content Creation",
  "XR Development",
  "Interactive Teaching",
  "Device Administration",
  "Collaboration",
  "Lab Infrastructure"
];

const imageBase = "/images/xr-catalogue/products";

export const xrCatalogueProducts: CatalogueProduct[] = [
  {
    id: "jef-xr-001",
    slug: "meta-quest-3-vr-headset-128gb",
    name: "Meta Quest 3 VR Headset",
    model: "128 GB",
    category: "XR and Spatial Computing",
    summary: "All-in-one VR/MR headset for education and training.",
    image: `${imageBase}/meta-quest-3-vr-headset-128gb.webp`,
    imageAlt: "Meta Quest 3 headset with Touch Plus controllers",
    specifications: [
      { label: "Storage", value: "128 GB" },
      { label: "Connectivity", value: "Wi-Fi 6E, USB-C" },
      { label: "Included", value: "Touch Plus controllers (2x)" }
    ],
    intendedUses: ["Student Learning", "XR Development"],
    capabilityTags: ["Wi-Fi 6E", "USB-C", "Touch Plus Controllers"],
    productCode: "JEF-XR-001",
    displayedPrice: "R15,999.00",
    pricingMode: "FIXED",
    featured: true,
    sourcePage: 3
  },
  {
    id: "jef-xr-002",
    slug: "meta-quest-3-vr-mr-headset-512gb-advanced",
    name: "Meta Quest 3 VR/MR Headset",
    model: "512 GB - Advanced",
    category: "XR and Spatial Computing",
    summary: "High-performance headset for expanded content and enterprise use.",
    image: `${imageBase}/meta-quest-3-vr-mr-headset-512gb-advanced.webp`,
    imageAlt: "Meta Quest 3 advanced headset with controllers",
    specifications: [
      { label: "Processor", value: "Snapdragon XR2 Gen 2" },
      { label: "Memory / storage", value: "8 GB RAM / 512 GB storage" },
      { label: "Display", value: "2,064 x 2,208 per eye, min 90 Hz" },
      { label: "Tracking", value: "Integrated 6DoF tracking" },
      { label: "Included", value: "Controllers, facial interface, strap, charger, batteries, USB 3.0 link cable" }
    ],
    intendedUses: ["Student Learning", "XR Development", "Device Administration"],
    capabilityTags: ["XR2 Gen 2", "512 GB", "Hand Tracking", "Passthrough"],
    productCode: "JEF-XR-002",
    pricingMode: "REQUEST_QUOTE",
    featured: true,
    sourcePage: 3
  },
  {
    id: "jef-xr-003",
    slug: "oculus-link-usb-c-cable-5m",
    name: "Oculus Link USB-C Cable",
    model: "5 m",
    category: "XR and Spatial Computing",
    subcategory: "Accessory",
    summary: "Reliable PC connectivity for VR content.",
    image: `${imageBase}/oculus-link-usb-c-cable-5m.webp`,
    imageAlt: "Black Oculus Link USB-C cable",
    specifications: [
      { label: "USB", value: "USB 3.2 Gen 1" },
      { label: "Length", value: "5 m minimum" },
      { label: "Use", value: "High-speed data transfer for PC VR" }
    ],
    intendedUses: ["XR Development", "Lecturer Content Creation"],
    capabilityTags: ["High-Speed", "5 Metres", "USB-C"],
    productCode: "JEF-XR-003",
    displayedPrice: "R499.00",
    pricingMode: "FIXED",
    sourcePage: 3
  },
  {
    id: "jef-xr-004",
    slug: "vr-headset-hygiene-silicone-covers",
    name: "VR Headset Hygiene / Silicone Covers",
    category: "XR and Spatial Computing",
    subcategory: "Accessory",
    summary: "Keep shared headsets clean and classroom ready.",
    image: `${imageBase}/vr-headset-hygiene-silicone-covers.webp`,
    imageAlt: "Black silicone hygiene cover for a VR headset",
    specifications: [
      { label: "Compatibility", value: "Compatible with Meta Quest 3" },
      { label: "Material", value: "Soft silicone material" },
      { label: "Care", value: "Easy to clean" },
      { label: "Use", value: "Ideal for shared-use environments" }
    ],
    intendedUses: ["Student Learning", "Device Administration"],
    capabilityTags: ["Hygienic", "Comfort Fit", "Shared Use"],
    productCode: "JEF-XR-004",
    displayedPrice: "R149.00",
    pricingMode: "FIXED",
    sourcePage: 3
  },
  {
    id: "jef-xr-005",
    slug: "vr-floor-safety-markers",
    name: "VR Floor Safety Markers",
    category: "XR and Spatial Computing",
    subcategory: "Safety",
    summary: "Create safe and defined VR play spaces.",
    image: `${imageBase}/vr-floor-safety-markers.webp`,
    imageAlt: "Yellow and black floor safety marker tape",
    specifications: [
      { label: "Material", value: "High-visibility vinyl markers" },
      { label: "Purpose", value: "Clearly defines boundaries" },
      { label: "Installation", value: "Easy to install and remove" },
      { label: "Use", value: "Ideal for classrooms and labs" }
    ],
    intendedUses: ["Student Learning", "Lab Infrastructure"],
    capabilityTags: ["High Visibility", "Boundary Control", "Safer Learning"],
    productCode: "JEF-XR-005",
    displayedPrice: "R750.00",
    pricingMode: "FIXED",
    sourcePage: 3
  },
  {
    id: "jef-pc-001",
    slug: "apple-imac-24-m4-student-workstation",
    name: "Apple iMac 24-inch (M4)",
    model: "Student Workstation",
    category: "Computing Workstations",
    summary: "Stylish, powerful and future-ready workstation for creative learning.",
    image: `${imageBase}/apple-imac-24-m4-student-workstation.webp`,
    imageAlt: "Apple iMac student workstation",
    specifications: [
      { label: "Chip", value: "Apple M4 chip" },
      { label: "Display", value: "24-inch Retina 4.5K display" },
      { label: "CPU / GPU", value: "8-core CPU, 10-core GPU" },
      { label: "Memory", value: "16 GB unified memory, configurable" },
      { label: "Storage", value: "512 GB SSD storage" },
      { label: "Operating system", value: "macOS Sequoia" }
    ],
    intendedUses: ["Student Learning", "Lecturer Content Creation", "XR Development"],
    capabilityTags: ["M4 Chip", "24-inch 4.5K Retina Display", "512 GB SSD", "macOS Sequoia"],
    productCode: "JEF-PC-001",
    displayedPrice: "R30,999.00",
    pricingMode: "FIXED",
    featured: true,
    sourcePage: 4
  },
  {
    id: "jef-pc-002",
    slug: "apple-imac-24-m4-instructor-workstation",
    name: "Apple iMac 24-inch (M4)",
    model: "Instructor Workstation",
    category: "Computing Workstations",
    summary: "More screens and greater possibilities for instructors and content creators.",
    image: `${imageBase}/apple-imac-24-m4-instructor-workstation.webp`,
    imageAlt: "Dual Apple iMac instructor workstation setup",
    specifications: [
      { label: "Chip", value: "Apple M4 chip" },
      { label: "Display", value: "24-inch Retina 4.5K display, dual screen" },
      { label: "CPU / GPU", value: "8-core CPU, 10-core GPU" },
      { label: "Memory", value: "16 GB unified memory, configurable" },
      { label: "Storage", value: "512 GB SSD storage" },
      { label: "Use", value: "Lecturers, facilitators and content creators" }
    ],
    intendedUses: ["Lecturer Content Creation", "Interactive Teaching", "XR Development"],
    capabilityTags: ["M4 Chip", "Dual 24-inch Displays", "512 GB SSD", "macOS Sequoia"],
    productCode: "JEF-PC-002",
    displayedPrice: "R32,399.00",
    pricingMode: "FIXED",
    featured: true,
    sourcePage: 4
  },
  {
    id: "jef-pc-003",
    slug: "high-performance-desktop-pc-all-in-one-alternative",
    name: "High-Performance Desktop PC",
    model: "All-in-One Alternative",
    category: "Computing Workstations",
    summary: "Reliable computing for learning environments.",
    image: `${imageBase}/high-performance-desktop-pc-all-in-one-alternative.webp`,
    imageAlt: "Desktop PC with monitor and keyboard",
    specifications: [
      { label: "Design", value: "Modern all-in-one design" },
      { label: "Processor", value: "Intel / AMD latest generation, configurable" },
      { label: "Memory", value: "16 GB RAM, expandable" },
      { label: "Storage", value: "512 GB SSD storage" },
      { label: "Operating system", value: "Windows 11 Pro" }
    ],
    intendedUses: ["Student Learning", "Device Administration", "XR Development"],
    capabilityTags: ["Intel / AMD", "Full HD Display", "512 GB SSD", "Windows 11 Pro"],
    productCode: "JEF-PC-003",
    displayedPrice: "R14,499.00",
    pricingMode: "FIXED",
    sourcePage: 4
  },
  {
    id: "jef-lap-001",
    slug: "laptop-for-education-and-training",
    name: "Laptop for Education & Training",
    category: "Computing Workstations",
    summary: "Portable, flexible and powerful device for learners, educators and field work.",
    image: `${imageBase}/laptop-for-education-and-training.webp`,
    imageAlt: "Laptop for education and training",
    specifications: [
      { label: "Display", value: "15.6-inch Full HD display" },
      { label: "Processor", value: "Intel Core i5 / Ryzen 5, configurable" },
      { label: "Memory", value: "16 GB RAM" },
      { label: "Storage", value: "512 GB SSD" },
      { label: "Operating system", value: "Windows 11 Pro" }
    ],
    intendedUses: ["Student Learning", "Lecturer Content Creation", "Collaboration"],
    capabilityTags: ["Intel / AMD", "15.6-inch Full HD", "512 GB SSD", "Windows 11 Pro"],
    productCode: "JEF-LAP-001",
    displayedPrice: "R11,999.00",
    pricingMode: "FIXED",
    sourcePage: 4
  },
  {
    id: "jef-fur-001",
    slug: "student-workstation-desk",
    name: "Student Workstation Desk",
    category: "Computing Workstations",
    subcategory: "Furniture",
    summary: "Ergonomic, durable and practical workstation furniture.",
    image: `${imageBase}/student-workstation-desk.webp`,
    imageAlt: "Student workstation desk",
    specifications: [
      { label: "Size", value: "1.2 m x 0.6 m workstation" },
      { label: "Adjustment", value: "Height adjustable" },
      { label: "Frame", value: "Sturdy steel frame" },
      { label: "Cable care", value: "Cable management options" }
    ],
    intendedUses: ["Student Learning", "Collaboration", "Lab Infrastructure"],
    capabilityTags: ["Height Adjustable", "Durable Build", "Cable Management"],
    productCode: "JEF-FUR-001",
    displayedPrice: "R3,499.00",
    pricingMode: "FIXED",
    sourcePage: 4
  },
  {
    id: "jef-fur-002",
    slug: "round-collaboration-table-5-person",
    name: "Round Collaboration Table",
    model: "5-Person",
    category: "Computing Workstations",
    subcategory: "Furniture",
    summary: "Collaborate, create and innovate around a shared project table.",
    image: `${imageBase}/round-collaboration-table-5-person.webp`,
    imageAlt: "Round collaboration table with five chairs",
    specifications: [
      { label: "Diameter", value: "900 mm diameter" },
      { label: "Seating", value: "Seating for 5 people" },
      { label: "Design", value: "Modern, durable design" },
      { label: "Use", value: "Group work and project-based learning" }
    ],
    intendedUses: ["Collaboration", "Interactive Teaching"],
    capabilityTags: ["5-Person", "Durable Design", "Modern Look"],
    productCode: "JEF-FUR-002",
    displayedPrice: "R2,199.00",
    pricingMode: "FIXED",
    sourcePage: 4
  },
  {
    id: "jef-tab-001",
    slug: "apple-ipad-pro-11-lidar-ar-content-creation-tablet",
    name: "Apple iPad Pro 11-inch",
    model: "LiDAR & AR Content-Creation Tablet",
    category: "Mobile AR and Content Creation",
    summary: "Professional-grade tablet for 3D scanning, AR content creation and immersive learning.",
    image: `${imageBase}/apple-ipad-pro-11-lidar-ar-content-creation-tablet.webp`,
    imageAlt: "Apple iPad Pro 11-inch with rugged case and stylus",
    specifications: [
      { label: "Chip", value: "M5-class chip with 9-core CPU, 10-core GPU and 16-core Neural Engine" },
      { label: "Memory / storage", value: "12 GB RAM / 512 GB SSD" },
      { label: "Display", value: "11-inch OLED/mini-LED, 2420 x 1668, 120 Hz" },
      { label: "Scanner", value: "Integrated LiDAR scanner" },
      { label: "Camera", value: "12 MP wide rear camera, 4K / ProRes" }
    ],
    intendedUses: ["Lecturer Content Creation", "XR Development", "Student Learning"],
    capabilityTags: ["M5-Class Processor", "LiDAR Scanner", "12 MP 4K / ProRes", "Apple Pencil Support"],
    productCode: "JEF-TAB-001",
    pricingMode: "REQUEST_QUOTE",
    featured: true,
    sourcePage: 5
  },
  {
    id: "jef-tab-002",
    slug: "ipad-air-11-inch-256gb-ar-learning-tablet",
    name: "iPad Air 11-inch",
    model: "256 GB",
    category: "Mobile AR and Content Creation",
    summary: "A powerful and lightweight tablet for AR learning and creative applications.",
    image: `${imageBase}/ipad-air-11-inch-256gb-ar-learning-tablet.webp`,
    imageAlt: "iPad Air 11-inch with Apple Pencil",
    specifications: [
      { label: "Chip", value: "M2 chip" },
      { label: "Display", value: "11-inch Liquid Retina display" },
      { label: "Storage", value: "256 GB storage" },
      { label: "AR", value: "LiDAR, ARKit" },
      { label: "Connectivity", value: "Wi-Fi 6" }
    ],
    intendedUses: ["Student Learning", "Lecturer Content Creation", "XR Development"],
    capabilityTags: ["M2 Chip", "11-inch Retina Display", "LiDAR & ARKit", "Wi-Fi 6"],
    productCode: "JEF-TAB-002",
    displayedPrice: "R10,399.00",
    pricingMode: "FIXED",
    sourcePage: 5
  },
  {
    id: "jef-tab-003",
    slug: "android-tablet-samsung-tab-a11",
    name: "Android Tablet",
    model: "e.g. Samsung Tab A11",
    category: "Mobile AR and Content Creation",
    summary: "Accessible AR learning device for education and classroom applications.",
    image: `${imageBase}/android-tablet-samsung-tab-a11.webp`,
    imageAlt: "Android tablet for classroom AR learning",
    specifications: [
      { label: "Memory", value: "6 GB RAM" },
      { label: "Processor", value: "ARCore" },
      { label: "Connectivity", value: "Wi-Fi 6" },
      { label: "Use", value: "Classroom applications" }
    ],
    intendedUses: ["Student Learning", "Interactive Teaching"],
    capabilityTags: ["Android OS", "6 GB RAM", "Wi-Fi 6", "Education Ready"],
    productCode: "JEF-TAB-003",
    displayedPrice: "R4,299.00",
    pricingMode: "FIXED",
    sourcePage: 5
  },
  {
    id: "jef-dsp-001",
    slug: "skye-hd-platinum-series-interactive-panel-86",
    name: "SKYE HD Platinum Series Interactive Panel",
    model: "86-inch",
    category: "Interactive Teaching",
    summary: "Premium interactive display for education, collaboration and digital learning.",
    image: `${imageBase}/skye-hd-platinum-series-interactive-panel-86.webp`,
    imageAlt: "86-inch interactive teaching panel on a mobile stand",
    specifications: [
      { label: "Display", value: "86-inch UHD 4K display" },
      { label: "Glass", value: "400 cd/m2, anti-glare, Mohs 7 glass" },
      { label: "Touch", value: "Infrared touch, 50 touch points" },
      { label: "System", value: "Android 15, 16 GB RAM / 256 GB" },
      { label: "Included", value: "Stand/wall mount, 2 styluses, wireless dongle" }
    ],
    intendedUses: ["Interactive Teaching", "Collaboration", "Lecturer Content Creation"],
    capabilityTags: ["86-inch 4K UHD", "50 Touch Points", "Android 15", "Built-in Camera & Audio"],
    productCode: "JEF-DSP-001",
    pricingMode: "REQUEST_QUOTE",
    featured: true,
    sourcePage: 6
  },
  {
    id: "jef-prj-001",
    slug: "full-hd-3d-dlp-projector-acer-x1528ki",
    name: "Full HD 3D DLP Projector",
    model: "Acer X1528Ki",
    category: "Interactive Teaching",
    summary: "Projection for simulations, training and presentations.",
    image: `${imageBase}/full-hd-3d-dlp-projector-acer-x1528ki.webp`,
    imageAlt: "Acer full HD 3D DLP projector",
    specifications: [
      { label: "Brightness", value: "4,000 lumens brightness" },
      { label: "Resolution", value: "1920 x 1080 Full HD" },
      { label: "3D", value: "Active 3D stereo support" },
      { label: "Mount", value: "Ceiling mount included" }
    ],
    intendedUses: ["Interactive Teaching", "Collaboration"],
    capabilityTags: ["4,000 Lumens", "Full HD 1080p", "3D Ready", "Ceiling Mount Included"],
    productCode: "JEF-PRJ-001",
    displayedPrice: "R11,259.00",
    pricingMode: "FIXED",
    sourcePage: 6
  },
  {
    id: "jef-scr-001",
    slug: "100-inch-motorised-projection-screen",
    name: "100-inch Motorised Projection Screen",
    category: "Interactive Teaching",
    summary: "Enhance the visual learning experience.",
    image: `${imageBase}/100-inch-motorised-projection-screen.webp`,
    imageAlt: "Motorised projection screen",
    specifications: [
      { label: "Size", value: "100-inch diagonal" },
      { label: "Optimisation", value: "3D optimised, motorised retractable" },
      { label: "Surface", value: "High-quality matte projection surface" },
      { label: "Mount", value: "Wall or ceiling mount options" }
    ],
    intendedUses: ["Interactive Teaching", "Collaboration"],
    capabilityTags: ["100-inch Screen", "Motorised Retractable", "3D Optimised", "Durable Surface"],
    productCode: "JEF-SCR-001",
    displayedPrice: "R1,609.00",
    pricingMode: "FIXED",
    sourcePage: 6
  },
  {
    id: "jef-chg-001",
    slug: "multi-port-usb-c-charging-station-16-port",
    name: "Multi-Port USB-C Charging Station",
    model: "16-Port",
    category: "Power, Charging and Storage",
    summary: "Efficient charging for VR headsets and mobile devices.",
    image: `${imageBase}/multi-port-usb-c-charging-station-16-port.webp`,
    imageAlt: "Multi-port USB-C charging station",
    specifications: [
      { label: "Ports", value: "16 USB-C ports" },
      { label: "Power", value: "18W+ per port, Power Delivery" },
      { label: "Charging", value: "Smart charging management" },
      { label: "Design", value: "Compact, durable design" }
    ],
    intendedUses: ["Device Administration", "Lab Infrastructure"],
    capabilityTags: ["16 USB-C Ports", "18W+ Per Port", "Smart Charging", "Durable Design"],
    productCode: "JEF-CHG-001",
    displayedPrice: "R2,499.00",
    pricingMode: "FIXED",
    featured: true,
    sourcePage: 6
  },
  {
    id: "jef-ups-001",
    slug: "ups-10-kva-workstation-protection",
    name: "UPS - 10 kVA",
    model: "Workstation Protection",
    category: "Power, Charging and Storage",
    summary: "Power protection for workstations and critical equipment.",
    image: `${imageBase}/ups-10-kva-workstation-protection.webp`,
    imageAlt: "10 kVA UPS workstation protection unit",
    specifications: [
      { label: "Runtime", value: "30-minute runtime" },
      { label: "Regulation", value: "Automatic voltage regulation" },
      { label: "Protection", value: "Protects workstations and critical equipment" }
    ],
    intendedUses: ["Lab Infrastructure", "Device Administration"],
    capabilityTags: ["Reliable Power", "30 Min Runtime", "Voltage Regulation"],
    productCode: "JEF-UPS-001",
    displayedPrice: "R18,119.00",
    pricingMode: "FIXED",
    sourcePage: 7
  },
  {
    id: "jef-ups-002",
    slug: "ups-3-kva-rack-mount-network",
    name: "UPS - 3 kVA Rack-Mount",
    model: "Network",
    category: "Power, Charging and Storage",
    summary: "Rack-mounted power protection for network equipment.",
    image: `${imageBase}/ups-3-kva-rack-mount-network.webp`,
    imageAlt: "3 kVA rack-mount UPS for network protection",
    specifications: [
      { label: "Design", value: "Rack-mount design" },
      { label: "Infrastructure", value: "Existing infrastructure - confirm meets requirements" },
      { label: "Protection", value: "Network equipment protection" }
    ],
    intendedUses: ["Lab Infrastructure", "Device Administration"],
    capabilityTags: ["Rack Mount", "Network Ready", "Stable Operation"],
    productCode: "JEF-UPS-002",
    displayedPrice: "R39,609.00",
    pricingMode: "FIXED",
    sourcePage: 7
  },
  {
    id: "jef-sec-001",
    slug: "secure-xr-charging-storage-cabinet-linkbasic-42u",
    name: "Secure XR Charging & Storage Cabinet",
    model: "Linkbasic 42U",
    category: "Power, Charging and Storage",
    summary: "Secure cabinet for headset charging, storage, thermal control and monitored access.",
    image: `${imageBase}/secure-xr-charging-storage-cabinet-linkbasic-42u.webp`,
    imageAlt: "Secure XR charging and storage cabinet",
    specifications: [
      { label: "Rack", value: "42U, 19-inch floor-standing rack" },
      { label: "Capacity", value: "20 headset sets per cabinet, 40 total" },
      { label: "Shelves", value: "8 heavy-duty shelves per cabinet" },
      { label: "Charging", value: "USB-C charging, 18W+ per headset" },
      { label: "Controls", value: "Top extraction fans and thermostatic control" },
      { label: "Security", value: "Lockable mesh doors and removable side panels" }
    ],
    intendedUses: ["Device Administration", "Lab Infrastructure"],
    capabilityTags: ["40 Headsets Total", "Thermal Control", "Secure & Monitored"],
    productCode: "JEF-SEC-001",
    pricingMode: "REQUEST_QUOTE",
    featured: true,
    sourcePage: 7
  },
  {
    id: "jef-sw-001",
    slug: "arborxr-device-management-system",
    name: "ArborXR Device Management System",
    model: "3-Year Institutional Licence",
    category: "Device Management",
    summary: "Device management for institutional XR fleets.",
    image: `${imageBase}/arborxr-device-management-system.webp`,
    imageAlt: "ArborXR device management dashboard on a laptop",
    specifications: [
      { label: "Management", value: "Remote device management" },
      { label: "Deployment", value: "App and content deployment" },
      { label: "Governance", value: "Security and compliance" },
      { label: "Usage", value: "Usage analytics" },
      { label: "Monitoring", value: "Fleet monitoring" }
    ],
    intendedUses: ["Device Administration", "Lab Infrastructure"],
    capabilityTags: ["Centralised Control", "Enhanced Security", "Real-Time Insights", "Scalable for Institutions"],
    productCode: "JEF-SW-001",
    pricingMode: "REQUEST_QUOTE",
    featured: true,
    sourcePage: 7
  }
];

export const xrLabSolutionCompositions = [
  {
    name: "Starter Immersive Classroom",
    summary: "For institutions beginning structured XR use with a manageable device set, display support and practical governance.",
    includes: ["XR headset set", "Instructor workstation", "Interactive display or projection", "Charging", "Basic device management", "Implementation support"]
  },
  {
    name: "Curriculum Creation Lab",
    summary: "For lecturers and content-development teams producing AR, VR and simulation-aligned learning resources.",
    includes: ["Higher-performance workstations", "Mobile content-creation devices", "XR headsets", "Collaboration furniture", "Curriculum-integration support"]
  },
  {
    name: "Institutional XR Lab",
    summary: "For larger managed deployments requiring secure storage, power protection, device management and operational support.",
    includes: ["Student and instructor workstations", "Headset fleet", "Secure charging and storage", "UPS and rack infrastructure", "Device management", "Operational support"]
  }
];

export const xrLabServices = [
  ["Assess", "Institutional needs and site-readiness assessment", "Clarifies curriculum priorities, facilities, people, power, connectivity and support needs."],
  ["Design", "XR Lab planning and solution design", "Maps use cases, room logic, equipment categories, governance, content and evidence requirements."],
  ["Equip", "Procurement and configuration support", "Connects hardware selection to teaching purpose and practical operating requirements."],
  ["Configure", "Device setup and management planning", "Supports provisioning, secure charging, storage, account logic and fleet-management readiness."],
  ["Enable", "Lecturer onboarding and XR teaching enablement", "Builds confidence for assigning, facilitating, debriefing and evaluating immersive learning."],
  ["Support", "Operational support and adoption reinforcement", "Helps the lab move from launch to sustained use through support records and review cadence."],
  ["Optimise", "Utilisation review and sustainability planning", "Reviews use, capability evidence, constraints and improvement priorities before scale."]
];

export function findCatalogueProduct(slug: string) {
  return xrCatalogueProducts.find((product) => product.slug === slug);
}

export function formatQuoteSummary(items: Array<{ product: CatalogueProduct; quantity: number }>) {
  return items.map(({ product, quantity }) => `${quantity} x ${product.name}${product.model ? ` (${product.model})` : ""} - ${product.productCode ?? product.id}`).join("\n");
}
