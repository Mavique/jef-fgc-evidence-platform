"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function EnterpriseField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(46, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0.2, 0.3, 8.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.setAttribute("data-testid", "enterprise-canvas");
    renderer.domElement.setAttribute("aria-label", "Animated 3D enterprise transformation system");
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const gold = new THREE.MeshBasicMaterial({ color: 0xffc968, transparent: true, opacity: 0.95 });
    const teal = new THREE.MeshBasicMaterial({ color: 0x69e3ff, transparent: true, opacity: 0.88 });
    const violet = new THREE.MeshBasicMaterial({ color: 0x8a7cff, transparent: true, opacity: 0.72 });
    const line = new THREE.LineBasicMaterial({ color: 0xffc968, transparent: true, opacity: 0.2 });

    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 2), gold);
    group.add(core);

    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 36; i += 1) {
      const layer = i % 3;
      const angle = i * 0.58;
      const radius = 1.5 + layer * 0.68;
      const point = new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(i * 0.7) * 1.15,
        Math.sin(angle) * radius * 0.68
      );
      points.push(point);
      const node = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), layer === 0 ? teal : layer === 1 ? gold : violet);
      node.position.copy(point);
      node.rotation.set(i * 0.2, i * 0.31, i * 0.13);
      group.add(node);
    }

    for (let i = 0; i < points.length; i += 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints([points[i], points[(i + 5) % points.length]]);
      group.add(new THREE.Line(geometry, line));
    }

    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x69e3ff, transparent: true, opacity: 0.16 });
    const ringGeometry = new THREE.TorusGeometry(2.9, 0.008, 8, 220);
    const rings = [0, 1, 2, 3].map((_, index) => {
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.set(index * 0.42, index * 0.74, index * 0.28);
      group.add(ring);
      return ring;
    });

    const resize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", resize);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = performance.now() * 0.00025;
      if (!reduceMotion) {
        core.rotation.x = t * 1.8;
        core.rotation.y = t * 2.3;
        group.rotation.y = t;
        rings.forEach((ring, index) => {
          ring.rotation.z = t * (index + 0.8);
          ring.rotation.x += 0.0012 * (index + 1);
        });
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      group.traverse((object) => {
        if ("geometry" in object && object.geometry instanceof THREE.BufferGeometry) object.geometry.dispose();
      });
      gold.dispose();
      teal.dispose();
      violet.dispose();
      line.dispose();
      ringMaterial.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}
