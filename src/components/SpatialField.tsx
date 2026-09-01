"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function SpatialField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0.35, 7.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.setAttribute("data-testid", "spatial-canvas");
    renderer.domElement.setAttribute("aria-label", "Animated 3D spatial learning network");
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x9cffd6, transparent: true, opacity: 0.92 });
    const hotMaterial = new THREE.MeshBasicMaterial({ color: 0x7fd7ff, transparent: true, opacity: 0.95 });
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x6bd9ff, transparent: true, opacity: 0.22 });
    const nodeGeometry = new THREE.SphereGeometry(0.035, 16, 16);
    const hotGeometry = new THREE.IcosahedronGeometry(0.11, 1);

    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 76; i += 1) {
      const ring = i % 4;
      const angle = i * 0.72;
      const radius = 1.2 + ring * 0.72 + Math.sin(i * 1.7) * 0.16;
      const point = new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(i * 0.48) * 1.05,
        Math.sin(angle) * radius * 0.56
      );
      points.push(point);

      const mesh = new THREE.Mesh(i % 17 === 0 ? hotGeometry : nodeGeometry, i % 17 === 0 ? hotMaterial : nodeMaterial);
      mesh.position.copy(point);
      group.add(mesh);
    }

    for (let i = 0; i < points.length; i += 1) {
      const next = (i + 7) % points.length;
      const geometry = new THREE.BufferGeometry().setFromPoints([points[i], points[next]]);
      group.add(new THREE.Line(geometry, lineMaterial));
    }

    const ringGeometry = new THREE.TorusGeometry(2.75, 0.006, 8, 180);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16 });
    const rings = [0, 1, 2].map((_, index) => {
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.set(index * 0.65, index * 0.42, index * 0.3);
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
      const t = performance.now() * 0.00022;
      if (!reduceMotion) {
        group.rotation.y = t;
        group.rotation.x = Math.sin(t * 1.8) * 0.08;
        rings.forEach((ring, index) => {
          ring.rotation.z = t * (index + 1.2);
          ring.rotation.x += 0.0018 * (index + 1);
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
      nodeGeometry.dispose();
      hotGeometry.dispose();
      ringGeometry.dispose();
      nodeMaterial.dispose();
      hotMaterial.dispose();
      lineMaterial.dispose();
      ringMaterial.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}
