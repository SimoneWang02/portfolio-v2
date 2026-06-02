/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useLayoutEffect, useEffect, useState } from 'react';
import { Color, CanvasTexture, DataTexture, RGBAFormat, UnsignedByteType } from 'three';

const hexToRGB = hex => {
  hex = hex.replace('#', '');
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  ];
};

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Single-pass shader: bg silk + text overlay, same uTime for every pixel.
// Replicates CSS filter: brightness(3) contrast(0.75) applied to white silk text.
// Combined formula: channel * 2.25 + 0.125 (with clamp).
const fragmentShader = `
varying vec2 vUv;

uniform float uTime;
uniform vec3  uBgColor;
uniform vec3  uTextColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;
uniform sampler2D uTextMask;

const float e = 2.71828182845904523536;

float noise(vec2 c) {
  float G = e;
  vec2 r = G * sin(G * c);
  return fract(r.x * r.y * (1.0 + c.x));
}

vec2 rotateUvs(vec2 uv, float a) {
  float c = cos(a); float s = sin(a);
  return mat2(c, -s, s, c) * uv;
}

void main() {
  float rnd     = noise(gl_FragCoord.xy);
  vec2  uv      = rotateUvs(vUv * uScale, uRotation);
  vec2  tex     = uv * uScale;
  float tOffset = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
    0.4 * sin(5.0 * (tex.x + tex.y +
                     cos(3.0 * tex.x + 5.0 * tex.y) +
                     0.02 * tOffset) +
             sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  float n = -rnd / 15.0 * uNoiseIntensity;

  vec3 bgCol   = clamp(uBgColor   * pattern + n, 0.0, 1.0);
  vec3 textRaw = uTextColor * pattern + n;
  vec3 textCol = clamp(textRaw * 2.25 + 0.125, 0.0, 1.0);

  // CanvasTexture flipY=true already converts canvas coords → GL coords
  float m = texture2D(uTextMask, vUv).r;

  gl_FragColor = vec4(mix(bgCol, textCol, m), 1.0);
}
`;

function useTextMask(text) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    let current = null;

    const build = async () => {
      await document.fonts.load(`400 1px "Big Shoulders Display"`);

      const w = window.innerWidth;
      const h = window.innerHeight;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);

      const fontSize = Math.max(64, Math.min(144, w * 0.1));
      ctx.font = `400 ${fontSize}px "Big Shoulders Display", sans-serif`;
      if ('letterSpacing' in ctx) ctx.letterSpacing = `${(-0.02 * fontSize).toFixed(2)}px`;
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, w / 2, h / 2);

      if (current) current.dispose();
      current = new CanvasTexture(canvas);
      setTexture(current);
    };

    build();
    window.addEventListener('resize', build);
    return () => {
      window.removeEventListener('resize', build);
      if (current) current.dispose();
    };
  }, [text]);

  return texture;
}

function HeroScene({ bgColor, textColor, speed, scale, noiseIntensity, rotation, maskTexture }) {
  const { viewport } = useThree();
  const meshRef = useRef();

  const fallback = useMemo(() => {
    const d = new DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1, RGBAFormat, UnsignedByteType);
    d.needsUpdate = true;
    return d;
  }, []);

  const uniforms = useMemo(() => ({
    uTime:           { value: 0 },
    uBgColor:        { value: new Color(...hexToRGB(bgColor)) },
    uTextColor:      { value: new Color(...hexToRGB(textColor)) },
    uSpeed:          { value: speed },
    uScale:          { value: scale },
    uNoiseIntensity: { value: noiseIntensity },
    uRotation:       { value: rotation },
    uTextMask:       { value: fallback },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  useLayoutEffect(() => {
    if (meshRef.current)
      meshRef.current.scale.set(viewport.width, viewport.height, 1);
  }, [viewport]);

  useEffect(() => {
    if (meshRef.current)
      meshRef.current.material.uniforms.uTextMask.value = maskTexture ?? fallback;
  }, [maskTexture, fallback]);

  useFrame((_, delta) => {
    if (meshRef.current)
      meshRef.current.material.uniforms.uTime.value += 0.1 * delta;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

export default function HeroSilk({
  bgColor = '#003a53',
  textColor = '#ffffff',
  speed = 4,
  scale = 1.2,
  noiseIntensity = 1.2,
  rotation = 0,
  text = 'Simone Wang',
}) {
  const maskTexture = useTextMask(text);

  return (
    <Canvas dpr={[1, 2]} frameloop="always" style={{ position: 'absolute', inset: 0 }}>
      <HeroScene
        bgColor={bgColor}
        textColor={textColor}
        speed={speed}
        scale={scale}
        noiseIntensity={noiseIntensity}
        rotation={rotation}
        maskTexture={maskTexture}
      />
    </Canvas>
  );
}
