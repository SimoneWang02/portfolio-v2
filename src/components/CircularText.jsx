import { useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import "./CircularText.css";

export default function CircularText({
	text = "",
	spinDuration = 20,
	onHover = null,
	className = "",
}) {
	const letters = Array.from(text);
	const rotation = useMotionValue(0);

	useEffect(() => {
		let cancelled = false;
		function spin(from) {
			if (cancelled) return;
			animate(rotation, from + 360, {
				duration: spinDuration,
				ease: "linear",
				onComplete: () => spin(from + 360),
			});
		}
		spin(0);
		return () => {
			cancelled = true;
			rotation.stop?.();
		};
	}, [spinDuration]);

	const handleMouseEnter = () => {
		if (onHover === "pause") {
			rotation.stop?.();
		} else if (onHover === "speedUp") {
			rotation.stop?.();
			animate(rotation, rotation.get() + 360, {
				duration: spinDuration / 4,
				ease: "linear",
				repeat: Infinity,
			});
		} else if (onHover === "slowDown") {
			rotation.stop?.();
			animate(rotation, rotation.get() + 360, {
				duration: spinDuration * 3,
				ease: "linear",
				repeat: Infinity,
			});
		} else if (onHover === "goBonkers") {
			rotation.stop?.();
			animate(rotation, rotation.get() + 360, {
				duration: spinDuration / 20,
				ease: "linear",
				repeat: Infinity,
			});
		}
	};

	const handleMouseLeave = () => {
		rotation.stop?.();
		animate(rotation, rotation.get() + 360, {
			duration: spinDuration,
			ease: "linear",
			repeat: Infinity,
		});
	};

	const radius = 60;

	return (
		<motion.div
			className={`circular-text ${className}`}
			style={{ rotate: rotation }}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			{letters.map((letter, i) => {
				const angle = (360 / letters.length) * i - 90;
				const rad = (angle * Math.PI) / 180;
				const x = Math.cos(rad) * radius;
				const y = Math.sin(rad) * radius;
				return (
					<span
						key={i}
						style={{
							transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${angle + 90}deg)`,
						}}
					>
						{letter}
					</span>
				);
			})}
		</motion.div>
	);
}
