import { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import HeroSilk from "./components/HeroSilk";
import CardSwap, { Card } from "./components/CardSwap";
import SpotifyWidget from "./components/SpotifyWidget";
import TextType from "./components/TextType";
import "./App.css";

const TOTAL_SLIDES = 3;

const timelineItems = [
	{
		year: "2024",
		title: "Senior Developer",
		desc: "Led frontend architecture for a SaaS platform serving 50k+ users.",
	},
	{
		year: "2023",
		title: "Full-Stack Engineer",
		desc: "Built real-time collaboration features with WebSockets and React.",
	},
	{
		year: "2022",
		title: "UI Engineer",
		desc: "Designed and shipped a design system adopted across 5 product teams.",
	},
	{
		year: "2021",
		title: "Software Engineer",
		desc: "Developed REST APIs and mobile-first responsive interfaces.",
	},
	{
		year: "2020",
		title: "Graduate & First Role",
		desc: "Computer Science degree. Joined a startup as a founding engineer.",
	},
];

const projectCards = [
	{ title: "Project One", sub: "React · Node.js · PostgreSQL" },
	{ title: "Project Two", sub: "Next.js · Vercel · Stripe" },
	{ title: "Project Three", sub: "TypeScript · GraphQL · AWS" },
	{ title: "Project Four", sub: "React Native · Firebase" },
	{ title: "Project Five", sub: "Python · FastAPI · Docker" },
	{ title: "Project Six", sub: "Vue 3 · D3.js · WebSockets" },
	{ title: "Project Seven", sub: "Svelte · Three.js · GLSL" },
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
		? isNext ? "scroll-hint--h-next" : "scroll-hint--h-prev"
		: isNext ? "scroll-hint--v-next" : "scroll-hint--v-prev";

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

export default function App() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [heroTextBounds, setHeroTextBounds] = useState(null);
	const [isLandscape, setIsLandscape] = useState(
		() => window.matchMedia("(orientation: landscape)").matches,
	);
	const sliderRef = useRef(null);
	const isAnimating = useRef(false);
	const timelineItemsRef = useRef([]);
	const timelineAnimated = useRef(false);
	const heroTextRef = useRef(null);

	useEffect(() => {
		const mq = window.matchMedia("(orientation: landscape)");
		const handler = (e) => setIsLandscape(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	// Snap to current slide on the new axis when orientation changes
	useEffect(() => {
		if (!sliderRef.current) return;
		gsap.set(sliderRef.current, {
			x: isLandscape ? -currentSlide * window.innerWidth : 0,
			y: isLandscape ? 0 : -currentSlide * window.innerHeight,
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

			isAnimating.current = true;
			setCurrentSlide(index);

			gsap.to(sliderRef.current, {
				x: isLandscape ? -index * window.innerWidth : 0,
				y: isLandscape ? 0 : -index * window.innerHeight,
				duration: 0.9,
				ease: "power4.inOut",
				onComplete: () => {
					isAnimating.current = false;
				},
			});

			if (index === 1 && !timelineAnimated.current) {
				timelineAnimated.current = true;
				setTimeout(() => {
					gsap.fromTo(
						timelineItemsRef.current,
						{ opacity: 0, y: 40 },
						{
							opacity: 1,
							y: 0,
							duration: 0.7,
							ease: "power3.out",
							stagger: 0.12,
							delay: 0.3,
						},
					);
				}, 600);
			}
		},
		[currentSlide, isLandscape],
	);

	useEffect(() => {
		let lastWheelTime = 0;

		const onWheel = (e) => {
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

	return (
		<div className="viewport">
			<div ref={sliderRef} className="slider">
				{/* Section 1 — Hero */}
				<section className="slide slide-hero">
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
							<svg className="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
							<svg className="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
								<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
							</svg>
						</a>
					</div>

					<SpotifyWidget />
					<h1 className="sr-only">Simone Wang</h1>

					<ScrollHint isLandscape={isLandscape} direction="next" onClick={() => goTo(1)} />
				</section>

				{/* Section 2 — Timeline */}
				<section className="slide slide-timeline">
					<div className="timeline-wrapper">
						<div className="timeline-header">
							<span className="section-index">02</span>
							<h2 className="section-title">Experience</h2>
						</div>
						<div className="timeline">
							<div className="timeline-line" />
							{timelineItems.map((item, i) => (
								<div
									key={i}
									className="timeline-item"
									ref={(el) => {
										timelineItemsRef.current[i] = el;
									}}
									style={{ opacity: 0 }}
								>
									<div className="timeline-year">
										{item.year}
									</div>
									<div className="timeline-dot" />
									<div className="timeline-content">
										<h3 className="timeline-item-title">
											{item.title}
										</h3>
										<p className="timeline-item-desc">
											{item.desc}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>

					<ScrollHint isLandscape={isLandscape} direction="prev" onClick={() => goTo(0)} />
					<ScrollHint isLandscape={isLandscape} direction="next" onClick={() => goTo(2)} />
				</section>

				{/* Section 3 — Projects */}
				<section className="slide slide-projects" style={{ position: "relative" }}>
					<div className="projects-left">
						<span className="section-index">03</span>
						<h2 className="section-title">Projects</h2>
						<p className="projects-desc">
							A selection of work across product, tooling, and
							experimentation.
						</p>
					</div>
					<div className="projects-cards">
						<CardSwap
							width={380}
							height={260}
							cardDistance={55}
							verticalDistance={60}
							delay={4000}
							pauseOnHover
							easing="elastic"
							skewAmount={5}
						>
							{projectCards.map((p, i) => (
								<Card key={i} customClass="project-card">
									<div className="project-card-inner">
										<span className="project-num">
											0{i + 1}
										</span>
										<h3 className="project-title">
											{p.title}
										</h3>
										<p className="project-sub">{p.sub}</p>
									</div>
								</Card>
							))}
						</CardSwap>
					</div>
					<ScrollHint isLandscape={isLandscape} direction="prev" onClick={() => goTo(1)} />
				</section>
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
		</div>
	);
}
