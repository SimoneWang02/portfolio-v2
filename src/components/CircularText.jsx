import { useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import "./CircularText.css";

export default function CircularText({
	text = "",
	spinDuration = 20,
	className = "",
}) {
	const letters = Array.from(text);
	const rotation = useMotionValue(0);

	useEffect(() => {
		const controls = animate(rotation, -360, {
			duration: spinDuration,
			ease: "linear",
			repeat: Infinity,
			repeatType: "loop",
		});
		return () => controls.stop();
	}, [spinDuration]);

	const radius = 60;

	return (
		<motion.div
			className={`circular-text ${className}`}
			style={{ rotate: rotation }}
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
