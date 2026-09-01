"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function WorkplaceField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 140);
    camera.position.set(0, 5.4, 12.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.setAttribute("data-testid", "workplace-canvas");
    renderer.domElement.setAttribute("aria-label", "Animated 3D Workplace 4.0 work signal");
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const cyan = new THREE.MeshBasicMaterial({ color: 0x4cecff, transparent: true, opacity: 0.9 });
    const amber = new THREE.MeshBasicMaterial({ color: 0xffc45a, transparent: true, opacity: 0.9 });
    const green = new THREE.MeshBasicMaterial({ color: 0x70f26d, transparent: true, opacity: 0.86 });
    const violet = new THREE.MeshBasicMaterial({ color: 0x9e82ff, transparent: true, opacity: 0.78 });
    const graphite = new THREE.MeshBasicMaterial({ color: 0xb6bfcc, transparent: true, opacity: 0.68 });
    const workLine = new THREE.LineBasicMaterial({ color: 0x4cecff, transparent: true, opacity: 0.28 });
    const humanLine = new THREE.LineBasicMaterial({ color: 0xffc45a, transparent: true, opacity: 0.46 });
    const learningLine = new THREE.LineBasicMaterial({ color: 0x9e82ff, transparent: true, opacity: 0.36 });

    const route: THREE.Vector3[] = [];
    const nodes: THREE.Mesh[] = [];
    const pulses: THREE.Mesh[] = [];
    const blockers: THREE.Mesh[] = [];

    for (let i = 0; i < 12; i += 1) {
      const point = new THREE.Vector3(-5 + i * 0.9, Math.sin(i * 0.75) * 0.62, Math.cos(i * 0.5) * 0.45);
      route.push(point);
      const node = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), i < 4 ? graphite : i < 8 ? cyan : green);
      node.position.copy(point);
      nodes.push(node);
      group.add(node);
    }

    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(route), workLine));

    [1, 3, 5, 8].forEach((index) => {
      const blocker = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 1), index === 5 ? amber : violet);
      blocker.position.set(route[index].x, route[index].y + 0.92, route[index].z);
      blockers.push(blocker);
      group.add(blocker);
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([route[index], blocker.position]), index === 5 ? humanLine : learningLine));
    });

    for (let i = 0; i < 5; i += 1) {
      const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), i === 4 ? green : cyan);
      pulse.position.copy(route[0]);
      pulses.push(pulse);
      group.add(pulse);
    }

    const teams: THREE.Mesh[] = [];
    for (let i = 0; i < 24; i += 1) {
      const angle = i * 0.5;
      const radius = 1.45 + (i % 5) * 0.46;
      const point = new THREE.Vector3(Math.cos(angle) * radius, 1.1 + Math.sin(i * 0.4) * 0.72, Math.sin(angle) * radius * 0.55);
      const team = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 1), i % 5 === 0 ? amber : i % 3 === 0 ? violet : cyan);
      team.position.copy(point);
      teams.push(team);
      group.add(team);
      if (i % 2 === 0) group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([point, route[i % route.length]]), workLine));
    }

    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x4cecff, transparent: true, opacity: 0.22 });
    const rings = [1.65, 2.65, 3.55].map((radius, index) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.01, 8, 180), ringMaterial);
      ring.position.set(0.2, 0.25, -0.1);
      ring.rotation.set(Math.PI / 2.35, 0.1 + index * 0.16, index * 0.44);
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
      const t = performance.now() * 0.0004;
      if (!reduceMotion) {
        group.rotation.y = Math.sin(t * 0.55) * 0.18;
        group.rotation.x = -0.16 + Math.sin(t * 0.4) * 0.045;
        nodes.forEach((node, index) => {
          node.position.y = route[index].y + Math.sin(t * 4 + index * 0.5) * 0.04;
          node.rotation.y += 0.008;
        });
        blockers.forEach((blocker, index) => {
          blocker.rotation.y += 0.012;
          blocker.rotation.x += 0.006;
          blocker.position.y += Math.sin(t * 5 + index) * 0.002;
        });
        pulses.forEach((pulse, index) => {
          const local = (t * (0.2 + index * 0.035) + index * 0.16) % 1;
          const scaled = local * (route.length - 1);
          const start = route[Math.floor(scaled)];
          const end = route[Math.min(route.length - 1, Math.floor(scaled) + 1)];
          pulse.position.copy(start).lerp(end, scaled % 1);
        });
        teams.forEach((team, index) => {
          team.rotation.y += 0.006;
          team.position.y += Math.sin(t * 3.6 + index) * 0.0015;
        });
        rings.forEach((ring, index) => {
          ring.rotation.z = t * (0.7 + index * 0.24);
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
      cyan.dispose();
      amber.dispose();
      green.dispose();
      violet.dispose();
      graphite.dispose();
      workLine.dispose();
      humanLine.dispose();
      learningLine.dispose();
      ringMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}
