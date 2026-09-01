"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function VocleField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, mount.clientWidth / mount.clientHeight, 0.1, 120);
    camera.position.set(0, 1.2, 9.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.setAttribute("data-testid", "vocle-canvas");
    renderer.domElement.setAttribute("aria-label", "Animated 3D cognitive learning loop");
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const indigo = new THREE.MeshBasicMaterial({ color: 0x6d6bff, transparent: true, opacity: 0.82 });
    const teal = new THREE.MeshBasicMaterial({ color: 0x55e6d4, transparent: true, opacity: 0.88 });
    const amber = new THREE.MeshBasicMaterial({ color: 0xffc86b, transparent: true, opacity: 0.92 });
    const white = new THREE.MeshBasicMaterial({ color: 0xf6f8ff, transparent: true, opacity: 0.78 });
    const loopLine = new THREE.LineBasicMaterial({ color: 0x55e6d4, transparent: true, opacity: 0.34 });
    const interventionLine = new THREE.LineBasicMaterial({ color: 0xffc86b, transparent: true, opacity: 0.5 });

    const nodes: THREE.Mesh[] = [];
    const points: THREE.Vector3[] = [];
    for (let index = 0; index < 28; index += 1) {
      const layer = index % 4;
      const angle = index * 0.58;
      const radius = 1.45 + layer * 0.42;
      const point = new THREE.Vector3(Math.cos(angle) * radius, Math.sin(index * 0.84) * 0.85, Math.sin(angle) * radius * 0.72);
      points.push(point);

      const material = layer === 0 ? teal : layer === 1 ? indigo : layer === 2 ? white : amber;
      const node = new THREE.Mesh(new THREE.SphereGeometry(layer === 3 ? 0.095 : 0.07, 18, 18), material);
      node.position.copy(point);
      nodes.push(node);
      group.add(node);
    }

    for (let index = 0; index < points.length; index += 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints([points[index], points[(index + 3) % points.length]]);
      group.add(new THREE.Line(geometry, index % 7 === 0 ? interventionLine : loopLine));
    }

    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 2), teal);
    group.add(core);

    const lecturer = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 1), amber);
    lecturer.position.set(2.3, 1.2, 0.35);
    group.add(lecturer);
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(2.3, 1.2, 0.35), new THREE.Vector3(0, 0, 0)]), interventionLine));

    const rings = [1.5, 2.3, 3.1].map((radius, index) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.006, 8, 180), index === 2 ? interventionLine as unknown as THREE.Material : loopLine as unknown as THREE.Material);
      ring.rotation.set(index * 0.72, index * 0.34, index * 0.2);
      group.add(ring);
      return ring;
    });

    const resize = () => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", resize);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = performance.now() * 0.00036;
      if (!reduceMotion) {
        group.rotation.y = t * 0.9;
        group.rotation.x = Math.sin(t * 0.7) * 0.08;
        core.rotation.x = t * 2.2;
        core.rotation.y = t * 2.8;
        lecturer.rotation.y = -t * 2;
        nodes.forEach((node, index) => {
          node.position.y = points[index].y + Math.sin(t * 4 + index) * 0.035;
        });
        rings.forEach((ring, index) => {
          ring.rotation.z = t * (index + 1) * 0.62;
        });
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      mount.removeChild(renderer.domElement);
      group.traverse((object) => {
        if ("geometry" in object && object.geometry instanceof THREE.BufferGeometry) object.geometry.dispose();
      });
      indigo.dispose();
      teal.dispose();
      amber.dispose();
      white.dispose();
      loopLine.dispose();
      interventionLine.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}
