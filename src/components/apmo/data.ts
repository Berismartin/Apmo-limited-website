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
import { compactSlug } from "@/lib/utils"

export const navItems = [
  { label: "Shop", href: "/shop" },
  { label: "Hair", href: "/hair" },
  { label: "Skin", href: "/skin" },
  { label: "Body", href: "/body" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const

const MODEL = "/images/new_images/models"

export const modelImages = {
  hairBed: `${MODEL}/IMG_4622.jpg`,
  hairSmile: `${MODEL}/IMG_4623.jpg`,
  hairPortrait: `${MODEL}/IMG_4626.jpg`,
  hairLeaveIn: `${MODEL}/IMG_4873.jpg`,
  hairWash: `${MODEL}/IMG_4884.jpg`,
  hairProducts: `${MODEL}/_DSF2021.jpg`,
  skinJars: `${MODEL}/IMG_4605.jpg`,
  skinJarsAlt: `${MODEL}/IMG_4604.jpg`,
  bodyLooking: `${MODEL}/IMG_4600.jpg`,
  bodyLotion: `${MODEL}/IMG_4593.jpg`,
  bodyPair: `${MODEL}/IMG_4619.jpg`,
  bodyCream: `${MODEL}/IMG_4597.jpg`,
  bodyLotionSmile: `${MODEL}/IMG_4601.jpg`,
  coffeeScrub: `${MODEL}/IMG_4613.jpg`,
  jarsFocus: `${MODEL}/_DSF2086.jpg`,
} as const

export const imageAssets = {
  hero: modelImages.hairLeaveIn,
  heroAlt: modelImages.hairPortrait,
  founder: modelImages.bodyPair,
  salon: modelImages.hairWash,
  product: modelImages.bodyPair,
  ritual: modelImages.hairSmile,
  team: modelImages.skinJars,
  texture: modelImages.hairBed,
} as const

export const collections = [
  {
    name: "Hair",
    href: "/hair",
    image: modelImages.hairSmile,
    copy: "Moisture, detangle, and definition for textured hair.",
  },
  {
    name: "Skin",
    href: "/skin",
    image: modelImages.skinJars,
    copy: "Jellies, washes, and daily glow for face and body.",
  },
  {
    name: "Body",
    href: "/body",
    image: modelImages.bodyPair,
    copy: "Lotions, butters, and scrubs that soften and restore.",
  },
  {
    name: "Kids",
    href: "/kids",
    image: modelImages.hairLeaveIn,
    copy: "Gentle care for little coils, curls, and wash days.",
  },
  {
    name: "Detergents",
    href: "/detergents",
    image: modelImages.bodyLotionSmile,
    copy: "Clean formulas for the rest of the home ritual.",
  },
] as const

export function modelImageForCategory(slug: string, name: string) {
  const token = `${compactSlug(slug)}${compactSlug(name)}`
  if (token.includes("hair")) return modelImages.hairSmile
  if (token.includes("skin")) return modelImages.skinJars
  if (token.includes("body")) return modelImages.bodyPair
  if (token.includes("kid") || token.includes("baby") || token.includes("child")) {
    return modelImages.hairLeaveIn
  }
  if (token.includes("detergent") || token.includes("laundry")) {
    return modelImages.bodyLotionSmile
  }
  return modelImages.hairSmile
}

// Real brand pillars (not fabricated metrics) — these describe what
// Apmo actually is, mirroring the About page's messaging.
export const stats = [
  { title: "Moisture-first", label: "Hydration rituals for coils, curls, and protective styles" },
  { title: "Consultative", label: "Routine guidance before you buy, not after" },
  { title: "Textured-hair focused", label: "Every product designed around real texture needs" },
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
    name: "Hair Spritz",
    category: "Detangle",
    image: "/images/new_images/_DSF2608.jpg",
    description: "An oil-infused mist that moisturizes wavy, curly, coily, and locked hair.",
  },
  {
    name: "Hair Butter",
    category: "Nourish",
    image: "/images/new_images/_DSF2605.jpg",
    description: "A rich botanical butter for softer, glossier, longer-looking strands.",
  },
  {
    name: "Pure Growth Oil",
    category: "Restore",
    image: "/images/new_images/_DSF2586.jpg",
    description: "A kids’ hair nourishing oil with sweet almond, coconut, and simsim oils.",
  },
] as const

export const portfolio = [
  {
    title: "Wash-day softness",
    image: modelImages.hairWash,
  },
  {
    title: "Skin that glows back",
    image: modelImages.skinJarsAlt,
  },
  {
    title: "Body care, held close",
    image: modelImages.bodyLotion,
  },
  {
    title: "Hair, in real life",
    image: modelImages.hairSmile,
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
      "Yes — the shop is live. Browse products, add them to your cart, and check out directly on the site. If you'd like guidance first, reach out on the Contact page.",
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
  { icon: FiAward, label: "Premium haircare rituals" },
] as const
