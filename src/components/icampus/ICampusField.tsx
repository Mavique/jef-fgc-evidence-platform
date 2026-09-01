"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ICampusField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 120);
    camera.position.set(0, 2.1, 10.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.setAttribute("data-testid", "icampus-canvas");
    renderer.domElement.setAttribute("aria-label", "Animated 3D connected learning campus");
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const blue = new THREE.MeshBasicMaterial({ color: 0x2f6bff, transparent: true, opacity: 0.8 });
    const teal = new THREE.MeshBasicMaterial({ color: 0x4ee8c6, transparent: true, opacity: 0.9 });
    const yellow = new THREE.MeshBasicMaterial({ color: 0xffd76a, transparent: true, opacity: 0.9 });
    const coral = new THREE.MeshBasicMaterial({ color: 0xff7f72, transparent: true, opacity: 0.82 });
    const pathLine = new THREE.LineBasicMaterial({ color: 0x4ee8c6, transparent: true, opacity: 0.28 });
    const guideLine = new THREE.LineBasicMaterial({ color: 0xffd76a, transparent: true, opacity: 0.5 });

    const points: THREE.Vector3[] = [];
    const nodes: THREE.Mesh[] = [];
    for (let i = 0; i < 42; i += 1) {
      const lane = i % 6;
      const angle = i * 0.46;
      const radius = 1.4 + lane * 0.34;
      const point = new THREE.Vector3(Math.cos(angle) * radius, Math.sin(i * 0.5) * 0.9, Math.sin(angle) * radius * 0.62);
      points.push(point);
      const material = lane === 0 ? yellow : lane === 1 || lane === 4 ? teal : lane === 2 ? coral : blue;
      const node = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.13), material);
      node.position.copy(point);
      node.rotation.set(i * 0.11, i * 0.17, i * 0.07);
      nodes.push(node);
      group.add(node);
    }

    for (let i = 0; i < points.length; i += 1) {
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([points[i], points[(i + 4) % points.length]]), i % 8 === 0 ? guideLine : pathLine));
    }

    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 2), teal);
    group.add(core);

    const learner = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 1), yellow);
    learner.position.set(-1.9, 1.2, 0.2);
    group.add(learner);
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([learner.position, new THREE.Vector3(0, 0, 0)]), guideLine));

    const rings = [1.8, 2.7, 3.65].map((radius, index) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.006, 8, 180), index === 1 ? guideLine as unknown as THREE.Material : pathLine as unknown as THREE.Material);
      ring.rotation.set(index * 0.45, index * 0.72, index * 0.18);
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
      const t = performance.now() * 0.00034;
      if (!reduceMotion) {
        group.rotation.y = t * 0.82;
        group.rotation.x = Math.sin(t * 0.6) * 0.06;
        core.rotation.x = t * 1.7;
        core.rotation.y = t * 2.4;
        learner.rotation.y = -t * 2.2;
        nodes.forEach((node, index) => {
          node.position.y = points[index].y + Math.sin(t * 4 + index * 0.4) * 0.04;
          node.rotation.y += 0.006;
        });
        rings.forEach((ring, index) => {
          ring.rotation.z = t * (index + 0.7);
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
      blue.dispose();
      teal.dispose();
      yellow.dispose();
      coral.dispose();
      pathLine.dispose();
      guideLine.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}
