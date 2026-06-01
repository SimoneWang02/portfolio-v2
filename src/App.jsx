import { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import Silk from "./components/Silk";
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

export default function App() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [heroTextBounds, setHeroTextBounds] = useState(null);
	const sliderRef = useRef(null);
	const isAnimating = useRef(false);
	const timelineItemsRef = useRef([]);
	const timelineAnimated = useRef(false);
	const silkTime = useRef(0);
	const heroTextRef = useRef(null);

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

	useEffect(() => {
		let last = performance.now();
		let raf;
		const tick = (now) => {
			silkTime.current += 0.1 * ((now - last) / 1000);
			last = now;
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, []);

	const goTo = useCallback(
		(index) => {
			if (isAnimating.current || index === currentSlide) return;
			if (index < 0 || index >= TOTAL_SLIDES) return;

			isAnimating.current = true;
			setCurrentSlide(index);

			gsap.to(sliderRef.current, {
				x: -index * window.innerWidth,
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
		[currentSlide],
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

	return (
		<div className="viewport">
			<div ref={sliderRef} className="slider">
				{/* Section 1 — Hero */}
				<section className="slide slide-hero">
					{/* Silk 1 — background */}
					<div className="silk-bg">
						<Silk
							color="#003a53"
							speed={4}
							scale={1.2}
							noiseIntensity={1.2}
							rotation={0}
							sharedTime={silkTime}
						/>
					</div>

					{/* SVG mask: white text shape on black */}
					<svg className="hero-mask-svg" aria-hidden="true">
						<defs>
							<mask id="heroNameMask">
								<rect width="100%" height="100%" fill="black" />
								<text
									className="hero-mask-text"
									x="50%"
									y="50%"
									textAnchor="middle"
									dominantBaseline="middle"
									fill="white"
								>
									Simone Wang
								</text>
							</mask>
						</defs>
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

					{/* Silk 2 — same props, white, visible only through name */}
					<div className="silk-name-overlay">
						<Silk
							color="#ffffff"
							speed={4}
							scale={1.2}
							noiseIntensity={1.2}
							rotation={0}
							sharedTime={silkTime}
						/>
					</div>

					<TextType
						text={["Fullstack Developer", "4+ years of experience"]}
						as="span"
						typingSpeed={75}
						pauseDuration={1500}
						deletingSpeed={50}
						showCursor
						cursorCharacter="_"
						cursorBlinkDuration={0.5}
						className="hero-corner hero-corner--br"
						style={heroTextBounds ? { right: heroTextBounds.right, top: heroTextBounds.topBelow } : undefined}
					/>
					<SpotifyWidget />
					<h1 className="sr-only">Simone Wang</h1>
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
				</section>

				{/* Section 3 — Projects */}
				<section className="slide slide-projects">
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
