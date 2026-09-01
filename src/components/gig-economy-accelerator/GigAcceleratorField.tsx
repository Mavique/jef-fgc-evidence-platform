"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function GigAcceleratorField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 140);
    camera.position.set(0, 5.1, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.setAttribute("data-testid", "gig-accelerator-canvas");
    renderer.domElement.setAttribute("aria-label", "Animated 3D income resilience accelerator");
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const teal = new THREE.MeshBasicMaterial({ color: 0x4fffe0, transparent: true, opacity: 0.9 });
    const amber = new THREE.MeshBasicMaterial({ color: 0xffc24d, transparent: true, opacity: 0.92 });
    const blue = new THREE.MeshBasicMaterial({ color: 0x5aa7ff, transparent: true, opacity: 0.82 });
    const green = new THREE.MeshBasicMaterial({ color: 0x71f26d, transparent: true, opacity: 0.86 });
    const graphite = new THREE.MeshBasicMaterial({ color: 0xb7bdc8, transparent: true, opacity: 0.72 });
    const railLine = new THREE.LineBasicMaterial({ color: 0x4fffe0, transparent: true, opacity: 0.28 });
    const protectionLine = new THREE.LineBasicMaterial({ color: 0x5aa7ff, transparent: true, opacity: 0.4 });
    const paymentLine = new THREE.LineBasicMaterial({ color: 0x71f26d, transparent: true, opacity: 0.48 });

    const routePoints: THREE.Vector3[] = [];
    const nodes: THREE.Mesh[] = [];
    const gates: THREE.Mesh[] = [];
    const pulses: THREE.Mesh[] = [];

    for (let i = 0; i < 14; i += 1) {
      const x = -5.2 + i * 0.8;
      const y = Math.sin(i * 0.72) * 0.8;
      const z = Math.cos(i * 0.45) * 0.55;
      const point = new THREE.Vector3(x, y, z);
      routePoints.push(point);
      const node = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), i < 4 ? graphite : i < 9 ? teal : i < 12 ? blue : green);
      node.position.copy(point);
      nodes.push(node);
      group.add(node);

      if ([4, 7, 9, 11].includes(i)) {
        const gate = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 1), i === 7 ? amber : blue);
        gate.position.set(x, y + 0.72, z);
        gates.push(gate);
        group.add(gate);
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([point, gate.position]), protectionLine));
      }
    }

    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(routePoints), railLine));

    const lowerRail = routePoints.map((point) => new THREE.Vector3(point.x, point.y - 1.15, point.z - 0.2));
    const upperRail = routePoints.map((point) => new THREE.Vector3(point.x, point.y + 1.15, point.z + 0.2));
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(lowerRail), protectionLine));
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(upperRail), protectionLine));

    for (let i = 0; i < 5; i += 1) {
      const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), i === 4 ? green : teal);
      pulse.position.copy(routePoints[0]);
      pulses.push(pulse);
      group.add(pulse);
    }

    const costCloud: THREE.Mesh[] = [];
    for (let i = 0; i < 18; i += 1) {
      const blocker = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13 + (i % 3) * 0.03, 1), i % 4 === 0 ? amber : graphite);
      blocker.position.set(-4.4 + (i % 6) * 1.55, -2.1 + Math.floor(i / 6) * 0.45, -0.8 + (i % 2) * 0.32);
      costCloud.push(blocker);
      group.add(blocker);
    }

    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffc24d, transparent: true, opacity: 0.24 });
    const rings = [1.55, 2.45, 3.35].map((radius, index) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.009, 8, 180), ringMaterial);
      ring.position.set(0.1, 0, -0.15);
      ring.rotation.set(Math.PI / 2.4, 0.15 + index * 0.18, index * 0.48);
      group.add(ring);
      return ring;
    });

    const paymentArc = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.2, -1.8, 0.3),
      new THREE.Vector3(3.2, -0.2, 0.9),
      new THREE.Vector3(4.4, 1.25, 0.2),
      new THREE.Vector3(5.25, 0.4, -0.45)
    ]);
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(paymentArc.getPoints(40)), paymentLine));

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
      const t = performance.now() * 0.00042;
      if (!reduceMotion) {
        group.rotation.y = Math.sin(t * 0.55) * 0.18;
        group.rotation.x = -0.15 + Math.sin(t * 0.45) * 0.045;
        nodes.forEach((node, index) => {
          node.position.y = routePoints[index].y + Math.sin(t * 4 + index * 0.55) * 0.04;
          node.rotation.y += 0.009;
        });
        gates.forEach((gate, index) => {
          gate.rotation.y += 0.012;
          gate.rotation.x += 0.006;
          gate.position.y += Math.sin(t * 5 + index) * 0.002;
        });
        pulses.forEach((pulse, index) => {
          const local = (t * (0.18 + index * 0.035) + index * 0.17) % 1;
          const scaled = local * (routePoints.length - 1);
          const start = routePoints[Math.floor(scaled)];
          const end = routePoints[Math.min(routePoints.length - 1, Math.floor(scaled) + 1)];
          pulse.position.copy(start).lerp(end, scaled % 1);
          pulse.scale.setScalar(1 + Math.sin(t * 9 + index) * 0.16);
        });
        rings.forEach((ring, index) => {
          ring.rotation.z = t * (0.8 + index * 0.26);
        });
        costCloud.forEach((item, index) => {
          item.rotation.y += 0.006;
          item.position.y += Math.sin(t * 3.7 + index) * 0.002;
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
      blue.dispose();
      green.dispose();
      graphite.dispose();
      railLine.dispose();
      protectionLine.dispose();
      paymentLine.dispose();
      ringMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}
