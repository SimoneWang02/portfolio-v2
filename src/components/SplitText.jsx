import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { SplitText as GSAPSplitText } from "gsap/SplitText";

gsap.registerPlugin(GSAPSplitText);

/**
 * Masked line reveal in the style of reactbits StaggeredMenu: each line is
 * clipped by an overflow-hidden wrapper and swings up from below
 * (`yPercent: 140`, slight rotation) on a `power4.out` ease.
 * https://reactbits.dev/components/staggered-menu
 *
 * Stays hidden until `play` turns true, then plays the reveal. Re-runs whenever
 * `text`, `play` or `replayKey` change, so a node can replay when its content
 * swaps.
 */
export default function SplitText({
	text,
	as: Tag = "p",
	className = "",
	splitType = "lines",
	mask = "lines",
	// Pivot from the top-left, not the center: wide lines tilted about their
	// centre swing a corner up past the mask edge and leak a few letters before
	// the reveal. A top-left origin keeps every point at/below the parked offset.
	from = { yPercent: 140, rotate: 6, transformOrigin: "0% 0%" },
	to = { yPercent: 0, rotate: 0 },
	duration = 0.55,
	ease = "power4.out",
	stagger = 0.05,
	startDelay = 0,
	play = true,
	replayKey,
	...rest
}) {
	const ref = useRef(null);

	useLayoutEffect(() => {
		const el = ref.current;
		if (!el || !text) return;

		const splitter = new GSAPSplitText(el, {
			type: splitType,
			mask: mask || undefined,
		});
		const targets =
			splitType === "lines"
				? splitter.lines
				: splitType === "words"
					? splitter.words
					: splitter.chars;

		gsap.set(targets, { ...from, immediateRender: true });

		let tween;
		if (play) {
			tween = gsap.to(targets, {
				...to,
				duration,
				ease,
				stagger,
				delay: startDelay,
			});
		}

		return () => {
			tween && tween.kill();
			splitter.revert();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [text, play, replayKey]);

	return (
		<Tag ref={ref} className={className} {...rest}>
			{text}
		</Tag>
	);
}
