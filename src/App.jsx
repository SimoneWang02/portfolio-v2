import {
	useRef,
	useState,
	useEffect,
	useLayoutEffect,
	useCallback,
} from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import HeroSilk from "./components/HeroSilk";
import Grainient from "./components/Grainient";
import SpotifyWidget from "./components/SpotifyWidget";
import TextType from "./components/TextType";
import SplitText from "./components/SplitText";
import "./App.css";

const TOTAL_SLIDES = 3;
const VISIBLE = 3;
const STRIP_COLORS = ["#9CA3AF", "#006895", "#004A6B"];

const timelineItems = [
	{
		year: "Set 2026 - Now",
		title: "NYU Tandon School of Engineering",
		desc: "Master of Science in Computer Science - Incoming Fall 2026",
		images: [],
	},
	{
		year: "Nov 2022 - May 2026",
		title: "Bonobo Srl",
		desc: "Grew from junior to senior developer, building full-stack apps with React, Laravel, Angular & AWS while managing client relationships end-to-end.",
		images: [
			"/images/timeline/bonobo/bonobo_1.jpg",
			"/images/timeline/bonobo/bonobo_2.jpg",
			"/images/timeline/bonobo/bonobo_3.jpg",
		],
	},
	{
		year: "Sep 2021 - Oct 2024",
		title: "University of Modena and Reggio Emilia",
		desc: "BSc in Computer Science - Graduated 104/110",
		images: [
			"/images/timeline/unimore/unimore_1.jpg",
			"/images/timeline/unimore/unimore_2.jpg",
			"/images/timeline/unimore/unimore_3.jpg",
		],
	},
	{
		year: "9 Apr 2002",
		title: "Spawn Point",
		desc: "Born in Mirandola, raised in Carpi (Modena, Italy)",
		images: ["/images/timeline/spawn_point/wanghino.jpg"],
	},
];

function seededRand(seed) {
	const x = Math.sin(seed + 1) * 10000;
	return x - Math.floor(x);
}

// Compute photo positions for the current viewport.
// Non-overlap guaranteed: each photo occupies an exclusive y-band.
// x positions are evenly distributed across the available width so photos
// never cluster at one side.
function computePhotoPositions() {
	const vw = window.innerWidth;
	const vh = window.innerHeight;

	// Photo size matches CSS: clamp(120px, 13vw, 200px)
	const photoW = Math.min(200, Math.max(120, 0.13 * vw));
	const photoH = photoW + 22;

	const titleFontPx = Math.min(72, Math.max(38.4, 0.06 * vw));
	const titleBottom = 0.04 * vh + 20 + titleFontPx * 0.95 + 40;

	const railX = 0.85 * vw;
	const cardW = Math.min(460, 0.6 * vw);
	const slidePad = 0.06 * vw;

	// X: from slide padding to just before the cards begin
	const areaX1 = slidePad;
	const areaX2 = Math.max(slidePad + photoW, railX - cardW - 40) - photoW;
	const areaY1 = Math.max(titleBottom, slidePad);
	const areaY2 = vh - photoH - 20;

	const areaCx = (areaX1 + areaX2) / 2;
	const areaCy = (areaY1 + areaY2) / 2;

	// Inter-photo spacing for pattern layouts
	const sp = photoW * 1.65;

	function getPattern(n) {
		const h3 = (sp * Math.sqrt(3)) / 2;
		switch (n) {
			case 1:
				return [[0, 0]];
			case 2:
				return [
					[sp * 0.12, -sp * 0.5],
					[-sp * 0.12, sp * 0.5],
				];
			case 3:
				return [
					[0, -((h3 * 2) / 3)],
					[-sp / 2, h3 / 3],
					[sp / 2, h3 / 3],
				];
			case 4:
				return [
					[-sp / 2, -sp / 2],
					[sp / 2, -sp / 2],
					[-sp / 2, sp / 2],
					[sp / 2, sp / 2],
				];
			case 5:
				return [
					[-sp / 2, -sp / 2],
					[sp / 2, -sp / 2],
					[0, 0],
					[-sp / 2, sp / 2],
					[sp / 2, sp / 2],
				];
			default:
				return null;
		}
	}

	return timelineItems.map((item, ei) => {
		const n = item.images.length;
		if (n === 0) {
			const s = ei * 17;
			const rotation = -15 + seededRand(s * 3.9) * 30;
			return [
				{
					x: (Math.max(areaX1, Math.min(areaX2, areaCx)) / vw) * 100,
					y: (Math.max(areaY1, Math.min(areaY2, areaCy)) / vh) * 100,
					rotation,
					delay: 0,
				},
			];
		}

		const pattern = getPattern(n);

		if (!pattern) {
			// 6+ photos: original scattered algorithm
			const xRange = Math.max(0, areaX2 - areaX1);
			const areaH = Math.max(0, areaY2 - areaY1);
			const bandH = areaH / n;

			return item.images.map((_, pi) => {
				const s = ei * 17 + pi * 11;
				const yTop = areaY1 + pi * bandH;
				const yBot = yTop + Math.max(0, bandH - photoH);
				const y = yTop + seededRand(s * 2.7) * (yBot - yTop);
				const slotW = xRange / n;
				const slotCx = areaX1 + (pi + 0.5) * slotW;
				const jitter = slotW * 0.35;
				const x = Math.max(
					areaX1,
					Math.min(
						areaX2,
						slotCx + (seededRand(s * 1.3) - 0.5) * 2 * jitter,
					),
				);
				const rotation = -16 + seededRand(s * 3.9) * 32;
				return {
					x: (x / vw) * 100,
					y: (y / vh) * 100,
					rotation,
					delay: pi * 0.08,
				};
			});
		}

		return pattern.map(([dx, dy], pi) => {
			const s = ei * 17 + pi * 11;
			const jx = (seededRand(s * 2.1) - 0.5) * photoW * 0.18;
			const jy = (seededRand(s * 1.7) - 0.5) * photoH * 0.18;

			const x = Math.max(areaX1, Math.min(areaX2, areaCx + dx + jx));
			const y = Math.max(areaY1, Math.min(areaY2, areaCy + dy + jy));

			const rotation = -15 + seededRand(s * 3.9) * 30;

			return {
				x: (x / vw) * 100,
				y: (y / vh) * 100,
				rotation,
				delay: pi * 0.08,
			};
		});
	});
}

const projectCards = [
	{
		title: "Project One",
		sub: "React · Node.js · PostgreSQL",
		desc: "A full-stack web application with real-time data sync, role-based access and a custom design system built from scratch.",
	},
	{
		title: "Project Two",
		sub: "Next.js · Vercel · Stripe",
		desc: "E-commerce storefront with server-side rendering, edge caching and a fully integrated checkout flow.",
	},
	{
		title: "Project Three",
		sub: "TypeScript · GraphQL · AWS",
		desc: "API platform serving multiple clients from a single typed schema, deployed on serverless infrastructure.",
	},
	{
		title: "Project Four",
		sub: "React Native · Firebase",
		desc: "Cross-platform mobile app with offline-first storage, push notifications and social authentication.",
	},
	{
		title: "Project Five",
		sub: "Python · FastAPI · Docker",
		desc: "Containerized backend service with async endpoints, background workers and automated CI/CD pipelines.",
	},
	{
		title: "Project Six",
		sub: "Vue 3 · D3.js · WebSockets",
		desc: "Live analytics dashboard streaming data over WebSockets into interactive, animated visualizations.",
	},
	{
		title: "Project Seven",
		sub: "Svelte · Three.js · GLSL",
		desc: "Experimental 3D web experience with custom shaders, scroll-driven camera paths and generative visuals.",
	},
];

function ScrollHint({ isLandscape, direction = "next", onClick }) {
	const isNext = direction === "next";
	let points;
	if (isLandscape) {
		points = isNext ? "9,6 15,12 9,18" : "15,6 9,12 15,18";
	} else {
		points = isNext ? "6,9 12,15 18,9" : "6,15 12,9 18,15";
	}

	const cls = isLandscape
		? isNext
			? "scroll-hint--h-next"
			: "scroll-hint--h-prev"
		: isNext
			? "scroll-hint--v-next"
			: "scroll-hint--v-prev";

	return (
		<button
			className={`scroll-hint ${cls}`}
			onClick={onClick}
			aria-label={isNext ? "Next section" : "Previous section"}
		>
			<svg
				className="scroll-hint-icon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<polyline points={points} />
			</svg>
		</button>
	);
}

// center: visual center in viewport coords, derived from CSS position (hover-transform-free)
// cssWidth/cssHeight: offsetWidth/offsetHeight — actual layout dimensions, not the rotated AABB
function PolaroidLightbox({
	src,
	rotation,
	center,
	cssWidth,
	cssHeight,
	onClose,
}) {
	const [phase, setPhase] = useState("enter");

	useEffect(() => {
		const raf1 = requestAnimationFrame(() => {
			const raf2 = requestAnimationFrame(() => setPhase("open"));
			return () => cancelAnimationFrame(raf2);
		});
		return () => cancelAnimationFrame(raf1);
	}, []);

	const handleClose = useCallback(() => {
		setPhase("exit");
		setTimeout(onClose, 460);
	}, [onClose]);

	const originLeft = center.x - cssWidth / 2;
	const originTop = center.y - cssHeight / 2;

	const TARGET_W = Math.min(window.innerWidth * 0.85, 560);
	// Expanded padding: 14px sides, 14px top, 64px bottom (classic polaroid strip)
	// Height = 14 + (TARGET_W - 28) + 64 = TARGET_W + 50
	const TARGET_H = TARGET_W + 50;
	const finalLeft = (window.innerWidth - TARGET_W) / 2;
	const finalTop = (window.innerHeight - TARGET_H) / 2;

	const isExpanded = phase === "open";

	const heroStyle = isExpanded
		? {
				left: finalLeft,
				top: finalTop,
				width: TARGET_W,
				padding: "14px 14px 64px",
				transform: "rotate(0deg)",
				boxShadow: "0 32px 80px rgba(0,0,0,0.85)",
			}
		: {
				left: originLeft,
				top: originTop,
				width: cssWidth,
				padding: "7px 7px 26px",
				transform: `rotate(${rotation}deg)`,
				boxShadow: "0 8px 24px rgba(0,0,0,0.65)",
			};

	return createPortal(
		<div
			className={`plb-overlay${isExpanded ? " plb-overlay--open" : ""}`}
			onClick={handleClose}
		>
			<div
				className="plb-hero"
				style={heroStyle}
				onClick={(e) => e.stopPropagation()}
			>
				<img src={src} alt="" draggable="false" />
				<button
					className={`plb-close${isExpanded ? " plb-close--visible" : ""}`}
					onClick={handleClose}
					aria-label="Close photo"
				>
					<svg
						viewBox="0 0 14 14"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinecap="round"
					>
						<line x1="1" y1="1" x2="13" y2="13" />
						<line x1="13" y1="1" x2="1" y2="13" />
					</svg>
				</button>
			</div>
		</div>,
		document.body,
	);
}

export default function App() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [heroTextBounds, setHeroTextBounds] = useState(null);
	const [isLandscape, setIsLandscape] = useState(
		() => window.matchMedia("(orientation: landscape)").matches,
	);
	const [winStart, setWinStart] = useState(0);
	const [photoPositions, setPhotoPositions] = useState(computePhotoPositions);
	const [hoveredEvent, setHoveredEvent] = useState(null);
	// Default to first item with images (Bonobo = index 1)
	const [selectedEvent, setSelectedEvent] = useState(1);
	const activeEvent = hoveredEvent ?? selectedEvent;
	const slideRefs = useRef([]);
	const stripRefs = useRef([]);
	const isAnimating = useRef(false);
	// Event texts split-animate in once Section 2 has been reached; the timeline
	// rail/cards themselves stay static (no entrance animation).
	const [timelinePlay, setTimelinePlay] = useState(false);
	const [lightboxPhoto, setLightboxPhoto] = useState(null);
	const [hiddenPhotoKey, setHiddenPhotoKey] = useState(null);
	// One-frame flag: suppresses the transition so the polaroid snaps to full
	// opacity the moment the hero unmounts (no visible gap or fade-in delay)
	const [revealingKey, setRevealingKey] = useState(null);
	const heroTextRef = useRef(null);

	useEffect(() => {
		const mq = window.matchMedia("(orientation: landscape)");
		const handler = (e) => setIsLandscape(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	// Initialise strips and slides off-screen before first paint
	useLayoutEffect(() => {
		gsap.set(stripRefs.current, { x: "100vw" });
		slideRefs.current.forEach((el, i) => {
			if (i === 0) {
				gsap.set(el, { xPercent: 0, yPercent: 0, zIndex: 1 });
			} else {
				gsap.set(el, { xPercent: 110, yPercent: 0, zIndex: 0 });
			}
		});
	}, []);

	// Re-snap all slides to the correct axis when orientation changes
	useEffect(() => {
		if (isAnimating.current) return;
		slideRefs.current.forEach((el, i) => {
			if (i === currentSlide) {
				gsap.set(el, { xPercent: 0, yPercent: 0 });
			} else {
				const sign = i > currentSlide ? 1 : -1;
				gsap.set(el, {
					xPercent: isLandscape ? sign * 110 : 0,
					yPercent: isLandscape ? 0 : sign * 110,
				});
			}
		});
	}, [isLandscape]);

	useEffect(() => {
		const measure = () => {
			if (!heroTextRef.current) return;
			const bbox = heroTextRef.current.getBBox();
			const gap = 20;
			setHeroTextBounds({
				left: bbox.x,
				right: window.innerWidth - (bbox.x + bbox.width),
				topAbove: bbox.y - gap,
				topBelow: bbox.y + bbox.height + gap,
			});
		};
		const id = setTimeout(measure, 100);
		window.addEventListener("resize", measure);
		return () => {
			clearTimeout(id);
			window.removeEventListener("resize", measure);
		};
	}, []);

	const goTo = useCallback(
		(index) => {
			if (isAnimating.current || index === currentSlide) return;
			if (index < 0 || index >= TOTAL_SLIDES) return;

			const direction = index > currentSlide ? 1 : -1;
			isAnimating.current = true;

			const strips = stripRefs.current;
			const newSlide = slideRefs.current[index];
			const oldSlide = slideRefs.current[currentSlide];
			const landscape = isLandscape;

			gsap.killTweensOf([...strips, newSlide]);

			const fromXPercent = landscape ? direction * 110 : 0;
			const fromYPercent = landscape ? 0 : direction * 110;
			const stripFromX = landscape ? `${direction * 100}vw` : 0;
			const stripFromY = landscape ? 0 : `${direction * 100}vh`;
			// Strips cover 65% of the scroll axis (width in landscape, height in
			// portrait). Going "next" they rest at the start edge (0); going
			// "previous" they rest at the far edge (100 - 65 = 35) so the wipe
			// sweeps the full extent symmetrically in both directions.
			const stripToX = landscape && direction < 0 ? "35vw" : 0;
			const stripToY = !landscape && direction < 0 ? "35vh" : 0;

			// New section comes in on top (z-index 10), strips at z-index 5 via overlay
			gsap.set(newSlide, {
				xPercent: fromXPercent,
				yPercent: fromYPercent,
				zIndex: 10,
			});
			gsap.set(oldSlide, { zIndex: 0 });
			gsap.set(strips, {
				x: stripFromX,
				y: stripFromY,
			});

			// ReactBits staggered-menu timing: strips stagger at 0.07s, panel follows at lastStrip+0.08s
			const STAGGER = 0.07;
			const STRIP_DUR = 0.5;
			const PANEL_DUR = 0.65;
			const panelAt = (strips.length - 1) * STAGGER + 0.08;

			const tl = gsap.timeline({
				onComplete: () => {
					isAnimating.current = false;
					setCurrentSlide(index);
					// Park old slide off-screen, reset z-indices
					gsap.set(oldSlide, {
						xPercent: landscape ? -direction * 110 : 0,
						yPercent: landscape ? 0 : -direction * 110,
						zIndex: 0,
					});
					gsap.set(newSlide, { zIndex: 1 });
					// Strips hidden behind new slide — reset off-screen silently
					gsap.set(strips, {
						x: stripFromX,
						y: stripFromY,
					});
					// Trigger the split-text reveal of the event copy on arrival.
					if (index === 1) setTimelinePlay(true);
				},
			});

			// Pre-layers stagger in (same as ReactBits sm-prelayer animation)
			strips.forEach((strip, i) => {
				tl.fromTo(
					strip,
					{ x: stripFromX, y: stripFromY },
					{
						x: stripToX,
						y: stripToY,
						duration: STRIP_DUR,
						ease: "power4.out",
					},
					i * STAGGER,
				);
			});

			// New section slides in last, overlapping strips mid-flight (like the menu panel)
			tl.fromTo(
				newSlide,
				{ xPercent: fromXPercent, yPercent: fromYPercent },
				{
					xPercent: 0,
					yPercent: 0,
					duration: PANEL_DUR,
					ease: "power4.out",
				},
				panelAt,
			);
		},
		[currentSlide, isLandscape],
	);

	useEffect(() => {
		let lastWheelTime = 0;

		const onWheel = (e) => {
			// Inside the projects list, let the native scroll run; only
			// change slide once the list is at its boundary.
			const scroller = e.target.closest?.(".projects-scroll");
			if (scroller) {
				const atTop = scroller.scrollTop <= 0;
				const atBottom =
					scroller.scrollTop + scroller.clientHeight >=
					scroller.scrollHeight - 1;
				if (e.deltaY > 0 && !atBottom) return;
				if (e.deltaY < 0 && !atTop) return;
			}

			const now = Date.now();
			if (now - lastWheelTime < 1000) return;
			lastWheelTime = now;

			if (e.deltaY > 0 || e.deltaX > 0) {
				goTo(currentSlide + 1);
			} else {
				goTo(currentSlide - 1);
			}
		};

		window.addEventListener("wheel", onWheel, { passive: true });
		return () => window.removeEventListener("wheel", onWheel);
	}, [currentSlide, goTo]);

	// Keyboard arrow navigation
	useEffect(() => {
		const onKeyDown = (e) => {
			if (e.key === "ArrowRight" || e.key === "ArrowDown") {
				goTo(currentSlide + 1);
			} else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
				goTo(currentSlide - 1);
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [currentSlide, goTo]);

	// Touch swipe support
	useEffect(() => {
		let touchStartX = 0;
		let touchStartY = 0;

		const onTouchStart = (e) => {
			touchStartX = e.touches[0].clientX;
			touchStartY = e.touches[0].clientY;
		};

		const onTouchEnd = (e) => {
			const dx = touchStartX - e.changedTouches[0].clientX;
			const dy = touchStartY - e.changedTouches[0].clientY;

			// In portrait the slide swipe is vertical, like the projects
			// list scroll — defer to the list until it hits a boundary.
			const scroller = e.target.closest?.(".projects-scroll");
			if (!isLandscape && scroller) {
				const atTop = scroller.scrollTop <= 0;
				const atBottom =
					scroller.scrollTop + scroller.clientHeight >=
					scroller.scrollHeight - 1;
				if (dy > 0 && !atBottom) return;
				if (dy < 0 && !atTop) return;
			}

			if (isLandscape) {
				if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
					goTo(currentSlide + (dx > 0 ? 1 : -1));
				}
			} else {
				if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 50) {
					goTo(currentSlide + (dy > 0 ? 1 : -1));
				}
			}
		};

		window.addEventListener("touchstart", onTouchStart, { passive: true });
		window.addEventListener("touchend", onTouchEnd, { passive: true });
		return () => {
			window.removeEventListener("touchstart", onTouchStart);
			window.removeEventListener("touchend", onTouchEnd);
		};
	}, [currentSlide, goTo, isLandscape]);

	useEffect(() => {
		const onResize = () => {
			setPhotoPositions(computePhotoPositions());
		};
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);

	// Reveal project rows as they scroll into view (one-shot per row).
	useEffect(() => {
		const rows = document.querySelectorAll(".proj-row");
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("proj-row--in");
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.2 },
		);
		rows.forEach((row) => observer.observe(row));
		return () => observer.disconnect();
	}, []);

	// When navigating the timeline window, select the first visible item with images.
	useEffect(() => {
		for (let i = winStart; i < winStart + VISIBLE; i++) {
			if (timelineItems[i]?.images.length > 0) {
				setSelectedEvent(i);
				break;
			}
		}
	}, [winStart]);

	// timelineItems are ordered newest → oldest. Navigation jumps by VISIBLE
	// so pages never overlap.
	const hasOlder = winStart + VISIBLE < timelineItems.length;
	const hasNewer = winStart > 0;
	const visibleItems = timelineItems.slice(winStart, winStart + VISIBLE);

	return (
		<div className="viewport">
			<div className="slider">
				{/* Section 1 — Hero */}
				<section
					ref={(el) => {
						slideRefs.current[0] = el;
					}}
					className="slide slide-hero"
				>
					{/* Single canvas: bg + text overlay in one render pass */}
					<HeroSilk />

					{/* Invisible SVG text — used only for bounds measurement */}
					<svg className="hero-mask-svg" aria-hidden="true">
						<text
							ref={heroTextRef}
							className="hero-mask-text"
							x="50%"
							y="50%"
							textAnchor="middle"
							dominantBaseline="middle"
							visibility="hidden"
						>
							Simone Wang
						</text>
					</svg>

					<TextType
						text={[
							"Fullstack Developer",
							"React + Laravel",
							"4 years building web apps",
							"Shipped 8 production apps",
						]}
						as="span"
						typingSpeed={75}
						pauseDuration={1500}
						deletingSpeed={50}
						showCursor
						cursorCharacter="_"
						cursorBlinkDuration={0.5}
						className="hero-corner hero-corner--br"
						style={
							heroTextBounds
								? {
										right: heroTextBounds.right,
										top: heroTextBounds.topBelow,
									}
								: undefined
						}
					/>

					<div
						className="hero-social"
						style={
							heroTextBounds
								? {
										left: heroTextBounds.left,
										top: heroTextBounds.topAbove + 10,
										transform: "translateY(-100%)",
									}
								: undefined
						}
					>
						<a
							href="https://gitlab.com/Zoubie"
							target="_blank"
							rel="noopener noreferrer"
							className="social-icon-link social-icon-link--gitlab"
							aria-label="GitLab"
						>
							<svg
								className="social-icon"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z" />
							</svg>
						</a>
						<a
							href="https://www.linkedin.com/in/simone-wang-b7024a256"
							target="_blank"
							rel="noopener noreferrer"
							className="social-icon-link social-icon-link--linkedin"
							aria-label="LinkedIn"
						>
							<svg
								className="social-icon"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
							</svg>
						</a>
					</div>

					<SpotifyWidget />
					<h1 className="sr-only">Simone Wang</h1>

					<ScrollHint
						isLandscape={isLandscape}
						direction="next"
						onClick={() => goTo(1)}
					/>
				</section>

				{/* Section 2 — Timeline */}
				<section
					ref={(el) => {
						slideRefs.current[1] = el;
					}}
					className="slide slide-timeline"
				>
					<Grainient
						color1="#002a3c"
						color2="#00344b"
						color3="#003e59"
						grainAmount={0.1}
						grainScale={2}
						timeSpeed={1}
						warpStrength={1}
						warpFrequency={5.0}
						warpSpeed={1}
						warpAmplitude={5}
						contrast={1.5}
						saturation={1}
						zoom={1}
						className="grainient-slide-bg"
					/>
					{/* Scattered polaroids — positioned at slide level */}
					<div className="exp-photos-scatter" aria-hidden="true">
						{timelineItems.map((item, ei) => {
							const isVisible = activeEvent === ei;
							if (item.images.length === 0) {
								const pos = photoPositions[ei]?.[0];
								if (!pos) return null;
								return (
									<div
										key={`photo-${ei}-placeholder`}
										className={`exp-polaroid exp-polaroid--placeholder${isVisible ? " exp-polaroid--visible" : ""}`}
										style={{
											left: `${pos.x}%`,
											top: `${pos.y}%`,
											"--rotation": `${pos.rotation}deg`,
											"--delay": "0s",
										}}
									>
										<div
											className="exp-polaroid-qmark"
											aria-hidden="true"
										>
											?
										</div>
									</div>
								);
							}
							return item.images.map((src, pi) => {
								const pos = photoPositions[ei][pi];
								const photoKey = `${ei}-${pi}`;
								const isOriginHidden =
									hiddenPhotoKey === photoKey;
								const isRevealing = revealingKey === photoKey;
								return (
									<div
										key={`photo-${ei}-${pi}`}
										className={`exp-polaroid${isVisible ? " exp-polaroid--visible" : ""}${isOriginHidden ? " exp-polaroid--origin-hidden" : ""}`}
										style={{
											left: `${pos.x}%`,
											top: `${pos.y}%`,
											"--rotation": `${pos.rotation}deg`,
											"--delay": `${pos.delay}s`,
											...(isRevealing
												? { transition: "none" }
												: {}),
										}}
										onClick={
											isVisible
												? (e) => {
														const el =
															e.currentTarget;
														const parent =
															el.parentElement;
														const parentRect =
															parent.getBoundingClientRect();
														const cssWidth =
															el.offsetWidth;
														const cssHeight =
															el.offsetHeight;
														setLightboxPhoto({
															src,
															rotation:
																pos.rotation,
															center: {
																x:
																	parentRect.left +
																	(pos.x /
																		100) *
																		parentRect.width +
																	cssWidth /
																		2,
																y:
																	parentRect.top +
																	(pos.y /
																		100) *
																		parentRect.height +
																	cssHeight /
																		2,
															},
															cssWidth,
															cssHeight,
														});
														setHiddenPhotoKey(
															photoKey,
														);
													}
												: undefined
										}
									>
										<img
											src={src}
											alt=""
											draggable="false"
										/>
									</div>
								);
							});
						})}
					</div>

					<div
						className="exp-wrap"
						style={
							timelinePlay ? undefined : { pointerEvents: "none" }
						}
					>
						<header className="exp-head">
							<span className="exp-overline">Career</span>
							<h2 className="exp-title">Experiences</h2>
						</header>

						<div className="exp-timeline">
							<div className="exp-rail">
								{/* Top: "now" dashed tail, or a control to step
								    back toward more recent events */}
								{hasNewer ? (
									<button
										type="button"
										className="exp-nav exp-nav--newer"
										onClick={() =>
											setWinStart((s) =>
												Math.max(0, s - VISIBLE),
											)
										}
										aria-label="Show more recent experiences"
									>
										<span className="exp-nav-label">
											Recent
										</span>
										<svg
											className="exp-nav-arrow"
											viewBox="0 0 16 44"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<line
												x1="8"
												y1="44"
												x2="8"
												y2="6"
											/>
											<polyline points="2,14 8,5 14,14" />
										</svg>
									</button>
								) : (
									<span
										className="exp-now"
										aria-hidden="true"
									/>
								)}

								{/* The visible events, newest at the top */}
								{visibleItems.map((item, i) => {
									const base = i * 0.07;
									const isLast =
										i === visibleItems.length - 1 &&
										!hasOlder;
									const globalIdx = winStart + i;
									const isActive =
										timelinePlay &&
										activeEvent === globalIdx;
									return (
										<div
											key={item.title}
											className={`exp-node${isLast ? " exp-node--last" : ""} ${isActive ? "exp-node--active" : "exp-node--dimmed"}`}
										>
											<div
												className="exp-card"
												onMouseEnter={() => {
													setHoveredEvent(globalIdx);
													setSelectedEvent(globalIdx);
												}}
												onMouseLeave={() =>
													setHoveredEvent(null)
												}
											>
												<SplitText
													as="span"
													className="exp-year"
													text={item.year}
													play={timelinePlay}
													replayKey={winStart}
													startDelay={base}
												/>
												<SplitText
													as="h3"
													className="exp-item-title"
													text={item.title}
													play={timelinePlay}
													replayKey={winStart}
													startDelay={base + 0.05}
												/>
												<SplitText
													as="p"
													className="exp-item-desc"
													text={item.desc}
													play={timelinePlay}
													replayKey={winStart}
													startDelay={base + 0.1}
												/>
											</div>
											<span className="exp-dot" />
										</div>
									);
								})}

								{/* Bottom: step toward older events */}
								{hasOlder && (
									<button
										type="button"
										className="exp-nav exp-nav--older"
										onClick={() =>
											setWinStart((s) => s + VISIBLE)
										}
										aria-label="Show older experiences"
									>
										<svg
											className="exp-nav-arrow"
											viewBox="0 0 16 44"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<line
												x1="8"
												y1="0"
												x2="8"
												y2="38"
											/>
											<polyline points="2,30 8,39 14,30" />
										</svg>
										<span className="exp-nav-label">
											Older
										</span>
									</button>
								)}
							</div>
						</div>
					</div>

					<ScrollHint
						isLandscape={isLandscape}
						direction="prev"
						onClick={() => goTo(0)}
					/>
					<ScrollHint
						isLandscape={isLandscape}
						direction="next"
						onClick={() => goTo(2)}
					/>
				</section>

				{/* Section 3 — Projects */}
				<section
					ref={(el) => {
						slideRefs.current[2] = el;
					}}
					className="slide slide-projects"
				>
					<Grainient
						color1="#002a3c"
						color2="#00344b"
						color3="#003e59"
						grainAmount={0.1}
						grainScale={2}
						timeSpeed={1}
						warpStrength={1}
						warpFrequency={5.0}
						warpSpeed={1}
						warpAmplitude={5}
						contrast={1.5}
						saturation={1}
						zoom={1}
						className="grainient-slide-bg"
					/>
					<header className="exp-head proj-head">
						<span className="exp-overline">Work</span>
						<h2 className="exp-title">Projects</h2>
					</header>
					<div className="projects-scroll">
						<ol className="proj-list">
							{projectCards.map((p, i) => (
								<li
									key={i}
									className={`proj-row${i % 2 ? " proj-row--flip" : ""}`}
								>
									<div className="proj-media">
										<span className="proj-media-num">
											{String(i + 1).padStart(2, "0")}
										</span>
									</div>
									<div className="proj-info">
										<span className="project-num">
											0{i + 1}
										</span>
										<h3 className="project-title">
											{p.title}
										</h3>
										<p className="project-sub">{p.sub}</p>
										<p className="proj-desc">{p.desc}</p>
									</div>
								</li>
							))}
						</ol>
					</div>
					<ScrollHint
						isLandscape={isLandscape}
						direction="prev"
						onClick={() => goTo(1)}
					/>
				</section>
			</div>

			{/* Staggered transition overlay */}
			<div className="transition-overlay" aria-hidden="true">
				{STRIP_COLORS.map((color, i) => (
					<div
						key={i}
						ref={(el) => {
							stripRefs.current[i] = el;
						}}
						className="transition-strip"
						style={{ background: color }}
					/>
				))}
			</div>

			{/* Nav dots */}
			<nav className="nav-dots">
				{Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
					<button
						key={i}
						className={`nav-dot ${currentSlide === i ? "active" : ""}`}
						onClick={() => goTo(i)}
						aria-label={`Go to slide ${i + 1}`}
					/>
				))}
			</nav>

			{lightboxPhoto && (
				<PolaroidLightbox
					src={lightboxPhoto.src}
					rotation={lightboxPhoto.rotation}
					center={lightboxPhoto.center}
					cssWidth={lightboxPhoto.cssWidth}
					cssHeight={lightboxPhoto.cssHeight}
					onClose={() => {
						// Batch: snap the original to full opacity (transition: none for 1 frame)
						// and unmount the hero in the same render pass — no gap, no double-visible
						setRevealingKey(hiddenPhotoKey);
						setHiddenPhotoKey(null);
						setLightboxPhoto(null);
						requestAnimationFrame(() => setRevealingKey(null));
					}}
				/>
			)}
		</div>
	);
}
