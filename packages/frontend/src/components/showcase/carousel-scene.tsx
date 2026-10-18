import { Image, useCursor, useTexture } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { easing } from 'maath';
import { Suspense, useEffect, useRef, type ReactNode } from 'react';
import * as THREE from 'three';

import './bent-plane-geometry';

export interface ShowcaseCard {
  id: string;
  name: string;
  /** Image URL for the card face (a data URL works). */
  art: string;
}

export interface FocusRequest {
  index: number;
  nonce: number;
}

interface CarouselSceneProps {
  cards: ShowcaseCard[];
  /** Card face height relative to its width. */
  aspect: number;
  activeId: string | null;
  focus: FocusRequest | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onFrontChange: (index: number) => void;
  onReady: () => void;
}

const RING_RADIUS = 1.75;
/** Viewport heights of wheel or swipe travel for one full turn of the ring. */
const TURN_VIEWPORTS = 3;
/** How long input must pause before the ring settles on the nearest card. */
const SETTLE_MS = 220;
/** Screen space, in CSS px, kept clear above the ring (masthead and KPI ribbon) and below it (caption). */
const CLEAR_TOP = 240;
const CLEAR_BOTTOM = 335;
/** Visible height per unit of camera distance for the 15° field of view. */
const VIEW_SLOPE = 2 * Math.tan(((15 / 2) * Math.PI) / 180);

/**
 * Camera distance and ring lift that fit a hovered card between the reserved
 * top and bottom bands, whatever the viewport height (the Fabric portal embeds
 * the app in a shorter frame than a full browser window).
 */
function fitRing(width: number, height: number, cardAspect: number) {
  // Below the lg breakpoint the masthead wraps and the ribbon sits lower.
  const clearTop = width < 1024 ? CLEAR_TOP + 64 : CLEAR_TOP;
  const room = Math.max(height * 0.3, height - clearTop - CLEAR_BOTTOM);
  // A hovered card scales to 1.15; leave a little air around it.
  const cardPx = Math.min(room / 1.2, height * 0.5);
  const frontDistance = (cardAspect * height) / (VIEW_SLOPE * cardPx);
  const portraitMin = width < height ? 20 : 14;
  const distance = Math.max(portraitMin, frontDistance + RING_RADIUS);
  // Centre the ring in the clear band rather than the whole viewport.
  // The camera sits slightly above the ring, which reads low; add a little more lift.
  const liftPx = (CLEAR_BOTTOM - clearTop) / 2 + 8;
  const lift = (liftPx * VIEW_SLOPE * (distance - RING_RADIUS)) / height;
  return { distance, lift };
}

type CardMaterial = THREE.ShaderMaterial & {
  radius: number;
  zoom: number;
  opacity: number;
};

export function CarouselScene(props: CarouselSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 100], fov: 15 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
    >
      <Suspense fallback={null}>
        <Rig
          rotation={[0, 0, 0.1]}
          cardAspect={props.aspect}
          count={props.cards.length}
          focus={props.focus}
          onFrontChange={props.onFrontChange}
        >
          <Carousel {...props} />
        </Rig>
      </Suspense>
    </Canvas>
  );
}

/**
 * Turns the ring from wheel and swipe input, settles on the nearest card when
 * input pauses, turns the short way to a requested card, and eases the camera
 * toward the pointer.
 */
function Rig({
  children,
  rotation,
  cardAspect,
  count,
  focus,
  onFrontChange,
}: {
  children: ReactNode;
  rotation: [number, number, number];
  cardAspect: number;
  count: number;
  focus: FocusRequest | null;
  onFrontChange: (index: number) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const front = useRef(-1);
  // Turns of the ring: `target` follows input, `turn.value` eases toward it.
  const target = useRef(0);
  const turn = useRef({ value: 0 });
  const size = useThree((state) => state.size);
  const { distance, lift } = fitRing(size.width, size.height, cardAspect);

  useEffect(() => {
    const travel = () => window.innerHeight * TURN_VIEWPORTS;
    const outsideScene = (event: Event) =>
      event.target instanceof Element && !!event.target.closest('[role="dialog"]');
    let settle: ReturnType<typeof setTimeout> | undefined;
    const nudge = (amount: number) => {
      target.current += amount;
      clearTimeout(settle);
      settle = setTimeout(() => {
        target.current = Math.round(target.current * count) / count;
      }, SETTLE_MS);
    };

    const onWheel = (event: WheelEvent) => {
      if (outsideScene(event)) return;
      nudge((event.deltaY + event.deltaX) / travel());
    };
    let lastY: number | null = null;
    const onTouchStart = (event: TouchEvent) => {
      lastY = outsideScene(event) ? null : event.touches[0].clientY;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (lastY === null) return;
      const y = event.touches[0].clientY;
      nudge(((lastY - y) * 2) / travel());
      lastY = y;
    };
    const onTouchEnd = () => (lastY = null);

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      clearTimeout(settle);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [count]);

  useEffect(() => {
    if (!focus) return;
    // Shortest signed distance, in turns, from where the ring is heading.
    const delta = ((((focus.index / count - target.current) % 1) + 1.5) % 1) - 0.5;
    target.current += delta;
  }, [focus, count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    easing.damp(turn.current, 'value', target.current, 0.25, delta);
    ref.current.rotation.y = -turn.current.value * Math.PI * 2;
    const index = ((Math.round(turn.current.value * count) % count) + count) % count;
    if (index !== front.current) {
      front.current = index;
      onFrontChange(index);
    }
    // Raycast every frame so hover follows cards that turn under a still pointer.
    state.events.update?.();
    easing.damp3(
      state.camera.position,
      [-state.pointer.x * 2, state.pointer.y + 1.5, distance],
      0.3,
      delta
    );
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group position={[0, lift, 0]}>
      <group ref={ref} rotation={rotation}>
        {children}
      </group>
    </group>
  );
}

function Carousel({
  cards,
  aspect,
  activeId,
  onHover,
  onSelect,
  onReady,
}: CarouselSceneProps) {
  const textures = useTexture(cards.map((card) => card.art), prepareTextures);

  useEffect(() => onReady(), [textures, onReady]);

  const count = cards.length;
  return cards.map((card, i) => {
    const angle = (i / count) * Math.PI * 2;
    return (
      <Card
        key={card.id}
        texture={textures[i]}
        label={card.name}
        aspect={aspect}
        active={activeId === card.id}
        position={[
          Math.sin(angle) * RING_RADIUS,
          0,
          Math.cos(angle) * RING_RADIUS,
        ]}
        rotation={[0, Math.PI + angle, 0]}
        onHoverChange={(hovered) => onHover(hovered ? card.id : null)}
        onSelect={() => onSelect(card.id)}
      />
    );
  });
}

function prepareTextures(loaded: THREE.Texture | THREE.Texture[]) {
  for (const texture of Array.isArray(loaded) ? loaded : [loaded]) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }
}

const worldPosition = new THREE.Vector3();

function Card({
  texture,
  label,
  aspect,
  active,
  position,
  rotation,
  onHoverChange,
  onSelect,
}: {
  texture: THREE.Texture;
  label: string;
  aspect: number;
  active: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
  onHoverChange: (hovered: boolean) => void;
  onSelect: () => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useCursor(active);

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const material = mesh.material as CardMaterial;
    easing.damp3(mesh.scale, active ? 1.15 : 1, 0.1, delta);
    easing.damp(material, 'radius', active ? 0.12 : 0.06, 0.2, delta);
    easing.damp(material, 'zoom', active ? 1 : 1.06, 0.2, delta);
    // Cards on the far side of the ring recede, standing in for scene fog.
    mesh.getWorldPosition(worldPosition);
    material.opacity = THREE.MathUtils.clamp(
      THREE.MathUtils.mapLinear(worldPosition.z, -RING_RADIUS, RING_RADIUS, 0.16, 1),
      0.16,
      1
    );
  });

  return (
    <Image
      ref={ref}
      name={label}
      texture={texture}
      transparent
      side={THREE.DoubleSide}
      position={position}
      rotation={rotation}
      onPointerOver={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        onHoverChange(true);
      }}
      onPointerOut={() => onHoverChange(false)}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <bentPlaneGeometry args={[0.1, 1, aspect, 20, 20]} />
    </Image>
  );
}
