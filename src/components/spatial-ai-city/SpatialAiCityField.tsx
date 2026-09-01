"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function SpatialAiCityField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 150);
    camera.position.set(0, 7.2, 11.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.setAttribute("data-testid", "spatial-ai-city-canvas");
    renderer.domElement.setAttribute("aria-label", "Animated 3D Living District Explorer");
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const teal = new THREE.MeshBasicMaterial({ color: 0x43f5dd, transparent: true, opacity: 0.88 });
    const amber = new THREE.MeshBasicMaterial({ color: 0xffca5c, transparent: true, opacity: 0.9 });
    const violet = new THREE.MeshBasicMaterial({ color: 0xa78bff, transparent: true, opacity: 0.76 });
    const green = new THREE.MeshBasicMaterial({ color: 0x7bf273, transparent: true, opacity: 0.78 });
    const slate = new THREE.MeshBasicMaterial({ color: 0xaeb9c8, transparent: true, opacity: 0.64 });
    const civicLine = new THREE.LineBasicMaterial({ color: 0x43f5dd, transparent: true, opacity: 0.3 });
    const participationLine = new THREE.LineBasicMaterial({ color: 0xffca5c, transparent: true, opacity: 0.42 });
    const scenarioLine = new THREE.LineBasicMaterial({ color: 0xa78bff, transparent: true, opacity: 0.36 });

    const blocks: THREE.Mesh[] = [];
    for (let x = -4; x <= 4; x += 1) {
      for (let z = -3; z <= 3; z += 1) {
        if ((x + z) % 3 === 0) continue;
        const height = 0.15 + ((Math.abs(x * 7 + z * 5) % 6) * 0.11);
        const block = new THREE.Mesh(new THREE.BoxGeometry(0.44, height, 0.44), (x + z) % 4 === 0 ? slate : teal);
        block.position.set(x * 0.62, height / 2 - 0.5, z * 0.62);
        blocks.push(block);
        group.add(block);
      }
    }

    const layerPoints: THREE.Vector3[] = [];
    for (let i = 0; i < 38; i += 1) {
      const angle = i * 0.48;
      const radius = 1.35 + (i % 7) * 0.35;
      const point = new THREE.Vector3(Math.cos(angle) * radius, 0.65 + (i % 5) * 0.28, Math.sin(angle) * radius * 0.72);
      layerPoints.push(point);
      const node = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 1), i % 6 === 0 ? amber : i % 4 === 0 ? violet : i % 5 === 0 ? green : teal);
      node.position.copy(point);
      group.add(node);
    }

    layerPoints.forEach((point, index) => {
      const next = layerPoints[(index + 6) % layerPoints.length];
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([point, next]), index % 5 === 0 ? participationLine : index % 4 === 0 ? scenarioLine : civicLine));
    });

    const rings = [1.7, 2.7, 3.9].map((radius, index) => {
      const material = new THREE.MeshBasicMaterial({ color: index === 1 ? 0xffca5c : index === 2 ? 0xa78bff : 0x43f5dd, transparent: true, opacity: 0.22 });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.01, 8, 180), material);
      ring.rotation.set(Math.PI / 2.05, 0.15 + index * 0.18, index * 0.42);
      ring.position.set(0, 0.42, 0);
      group.add(ring);
      return { ring, material };
    });

    const civicBeacons = [
      new THREE.Vector3(-3.2, 1.7, -1.2),
      new THREE.Vector3(-1.1, 2.25, 1.9),
      new THREE.Vector3(1.4, 1.85, -1.6),
      new THREE.Vector3(3.1, 2.35, 1.2)
    ];
    civicBeacons.forEach((point, index) => {
      const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 1), index === 1 ? amber : index === 3 ? violet : green);
      beacon.position.copy(point);
      group.add(beacon);
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([point, new THREE.Vector3(0, 0.2, 0)]), index === 3 ? scenarioLine : participationLine));
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
      const t = performance.now() * 0.00035;
      if (!reduceMotion) {
        group.rotation.y = Math.sin(t * 0.55) * 0.2;
        group.rotation.x = -0.2 + Math.sin(t * 0.36) * 0.045;
        blocks.forEach((block, index) => {
          block.position.y += Math.sin(t * 3.8 + index) * 0.0015;
        });
        rings.forEach(({ ring }, index) => {
          ring.rotation.z = t * (0.65 + index * 0.28);
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
      teal.dispose();
      amber.dispose();
      violet.dispose();
      green.dispose();
      slate.dispose();
      civicLine.dispose();
      participationLine.dispose();
      scenarioLine.dispose();
      rings.forEach(({ material }) => material.dispose());
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}
