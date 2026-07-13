import {
  FiAward,
  FiAperture,
  FiCheckCircle,
  FiDroplet,
  FiFeather,
  FiHeart,
  FiShield,
  FiSun,
  FiZap,
} from "react-icons/fi"

export const navItems = [
  { label: "Shop", href: "/shop" },
  { label: "Haircare", href: "/haircare" },
  { label: "Rituals", href: "/rituals" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const

export const imageAssets = {
  hero: "/images/site_images/IMG_1706.jpg",
  heroAlt: "/images/site_images/FRNK-1955.jpg",
  founder: "/images/site_images/FRNK-2056.jpg",
  salon: "/images/site_images/FRNK-2012.jpg",
  product: "/images/site_images/FRNK-2049.jpg",
  ritual: "/images/site_images/FRNK-1986.jpg",
  team: "/images/site_images/FRNK-1419.jpg",
  texture: "/images/site_images/FRNK-2035.jpg",
} as const

export const stats = [
  { value: 12, suffix: "+", label: "signature formulas" },
  { value: 8, suffix: "k+", label: "hair journeys supported" },
  { value: 96, suffix: "%", label: "reported softer curls" },
] as const

export const features = [
  {
    icon: FiDroplet,
    title: "Moisture-first care",
    copy: "Layered hydration rituals designed for coils, curls, protective styles, and sensitive scalps.",
  },
  {
    icon: FiFeather,
    title: "Lightweight finish",
    copy: "Products absorb cleanly, leaving hair soft and touchable without a heavy residue.",
  },
  {
    icon: FiShield,
    title: "Daily confidence",
    copy: "Made for busy routines: detangle, nourish, protect, and glow with fewer steps.",
  },
] as const

export const services = [
  {
    icon: FiAperture,
    title: "Growth Rituals",
    copy: "Personalized scalp and strand routines for stronger, healthier-looking hair.",
    progress: 92,
  },
  {
    icon: FiSun,
    title: "Event Styling",
    copy: "Camera-ready beauty support for launches, shoots, bridal mornings, and brand moments.",
    progress: 86,
  },
  {
    icon: FiZap,
    title: "Product Education",
    copy: "Hands-on guidance so every customer understands exactly how to use each formula.",
    progress: 78,
  },
] as const

export const products = [
  {
    name: "Petangler Mist",
    category: "Detangle",
    image: "/images/site_images/FRNK-2056.jpg",
    description: "A slip-rich mist for quick comb-throughs and soft curl definition.",
  },
  {
    name: "Growth Milk",
    category: "Nourish",
    image: "/images/site_images/FRNK-2049.jpg",
    description: "A creamy botanical blend that leaves strands hydrated and glossy.",
  },
  {
    name: "Scalp Revival Oil",
    category: "Restore",
    image: "/images/site_images/IMG_1706.jpg",
    description: "A lightweight oil for massage rituals, shine, and scalp comfort.",
  },
] as const

export const portfolio = [
  {
    title: "At-home hair rituals",
    image: "/images/site_images/FRNK-1955.jpg",
  },
  {
    title: "Product-led confidence",
    image: "/images/site_images/FRNK-328 (1).jpg",
  },
  {
    title: "Community beauty moments",
    image: "/images/site_images/FRNK-2012.jpg",
  },
  {
    title: "Salon-ready education",
    image: "/images/site_images/IMG_1660.jpg",
  },
] as const

export const faqs = [
  {
    question: "What hair types are Apmo products designed for?",
    answer:
      "The rituals are built for textured hair, curls, coils, protective styles, relaxed hair, and anyone seeking gentle hydration and easier detangling.",
  },
  {
    question: "Can I request product guidance before buying?",
    answer:
      "Yes. The brand experience is intentionally consultative, so customers can receive routine recommendations before choosing a product.",
  },
  {
    question: "Is the website live for orders yet?",
    answer:
      "The public reference site is currently under construction. This recreation presents the premium launch experience and directs visitors to contact the team.",
  },
] as const

export const timeline = [
  {
    step: "01",
    title: "Understand the hair story",
    copy: "We begin with texture, routine, climate, and the real-world friction in each customer journey.",
  },
  {
    step: "02",
    title: "Build the ritual",
    copy: "Products, education, and styling guidance are layered into a simple repeatable system.",
  },
  {
    step: "03",
    title: "Reveal lasting confidence",
    copy: "The result is hair that feels cared for, camera-ready, and easier to maintain.",
  },
] as const

export const trustMarks = [
  { icon: FiCheckCircle, label: "Textured hair focused" },
  { icon: FiHeart, label: "Community-led beauty" },
  { icon: FiAward, label: "Premium launch experience" },
] as const
