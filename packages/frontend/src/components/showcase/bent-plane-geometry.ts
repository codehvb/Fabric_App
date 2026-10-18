import { extend, type ThreeElement } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * A plane whose width is bent along a circular arc, so cards placed on a ring
 * curve with it. `radius` is the bulge depth at the plane's centre.
 */
export class BentPlaneGeometry extends THREE.PlaneGeometry {
  constructor(
    radius: number,
    width?: number,
    height?: number,
    widthSegments?: number,
    heightSegments?: number
  ) {
    super(width, height, widthSegments, heightSegments);
    const hw = this.parameters.width * 0.5;
    const a = new THREE.Vector2(-hw, 0);
    const b = new THREE.Vector2(0, radius);
    const c = new THREE.Vector2(hw, 0);
    const ab = new THREE.Vector2().subVectors(a, b);
    const bc = new THREE.Vector2().subVectors(b, c);
    const ac = new THREE.Vector2().subVectors(a, c);
    const r =
      (ab.length() * bc.length() * ac.length()) / (2 * Math.abs(ab.cross(ac)));
    const center = new THREE.Vector2(0, radius - r);
    const baseAngle =
      new THREE.Vector2().subVectors(a, center).angle() - Math.PI * 0.5;
    const arc = baseAngle * 2;
    const uv = this.attributes.uv;
    const pos = this.attributes.position;
    const point = new THREE.Vector2();
    for (let i = 0; i < uv.count; i++) {
      point.copy(c).rotateAround(center, arc * (1 - uv.getX(i)));
      pos.setXYZ(i, point.x, pos.getY(i), -point.y);
    }
    pos.needsUpdate = true;
  }
}

extend({ BentPlaneGeometry });

declare module '@react-three/fiber' {
  interface ThreeElements {
    bentPlaneGeometry: ThreeElement<typeof BentPlaneGeometry>;
  }
}
