"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function WorxStreamField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.1, 130);
    camera.position.set(0, 5.6, 11.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.setAttribute("data-testid", "worxstream-canvas");
    renderer.domElement.setAttribute("aria-label", "Animated 3D opportunity routing field");
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const verified = new THREE.MeshBasicMaterial({ color: 0x62f6a3, transparent: true, opacity: 0.9 });
    const review = new THREE.MeshBasicMaterial({ color: 0x7fd7ff, transparent: true, opacity: 0.86 });
    const pending = new THREE.MeshBasicMaterial({ color: 0xffce6a, transparent: true, opacity: 0.88 });
    const consent = new THREE.MeshBasicMaterial({ color: 0xff7b86, transparent: true, opacity: 0.86 });
    const laneLine = new THREE.LineBasicMaterial({ color: 0x62f6a3, transparent: true, opacity: 0.32 });
    const gateLine = new THREE.LineBasicMaterial({ color: 0xffce6a, transparent: true, opacity: 0.54 });
    const ghostLine = new THREE.LineBasicMaterial({ color: 0x7fd7ff, transparent: true, opacity: 0.2 });

    const nodeGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const gateGeometry = new THREE.OctahedronGeometry(0.24, 1);
    const nodes: THREE.Mesh[] = [];
    const gates: THREE.Mesh[] = [];
    const pulses: THREE.Mesh[] = [];
    const routes: THREE.Vector3[][] = [];

    const routeTargets = [
      new THREE.Vector3(4.4, 1.95, -0.85),
      new THREE.Vector3(4.9, 0.72, -0.22),
      new THREE.Vector3(4.65, -0.48, 0.28),
      new THREE.Vector3(3.9, -1.78, 0.86),
      new THREE.Vector3(2.6, -2.82, 1.12)
    ];

    const origin = new THREE.Vector3(-4.7, 0, 0);
    routeTargets.forEach((target, index) => {
      const points = [
        origin,
        new THREE.Vector3(-2.3, Math.sin(index) * 0.55, index * 0.18 - 0.35),
        new THREE.Vector3(0, (index - 2) * 0.52, Math.cos(index) * 0.55),
        new THREE.Vector3(1.85, target.y * 0.64, target.z * 0.7),
        target
      ];
      routes.push(points);
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), index === 1 || index === 3 ? gateLine : laneLine));

      points.slice(1, -1).forEach((point, pointIndex) => {
        const gate = new THREE.Mesh(gateGeometry, pointIndex === 1 ? consent : pointIndex === 2 ? pending : review);
        gate.position.copy(point);
        gate.rotation.set(index * 0.25, pointIndex * 0.7, index * 0.18);
        gates.push(gate);
        group.add(gate);
      });

      const targetNode = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 1), index === 0 ? verified : index === 2 ? pending : review);
      targetNode.position.copy(target);
      nodes.push(targetNode);
      group.add(targetNode);

      const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), index === 3 ? consent : verified);
      pulse.position.copy(origin);
      pulses.push(pulse);
      group.add(pulse);
    });

    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.58, 2), verified);
    core.position.copy(origin);
    group.add(core);

    for (let i = 0; i < 18; i += 1) {
      const x = -4.8 + i * 0.56;
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, -3.2, -0.75), new THREE.Vector3(x + 0.25, 3.2, -0.75)]), ghostLine));
    }

    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x7fd7ff, transparent: true, opacity: 0.28 });
    const rings = [1.55, 2.6, 3.7].map((radius, index) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.009, 8, 190), ringMaterial);
      ring.position.set(-0.55 + index * 0.42, 0, -0.15);
      ring.rotation.set(Math.PI / 2.65, 0.2 + index * 0.22, index * 0.55);
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
      const t = performance.now() * 0.00042;
      if (!reduceMotion) {
        group.rotation.y = Math.sin(t * 0.6) * 0.18;
        group.rotation.x = -0.18 + Math.sin(t * 0.4) * 0.045;
        core.rotation.y = t * 2.2;
        gates.forEach((gate, index) => {
          gate.rotation.y += 0.01 + index * 0.0005;
          gate.position.z += Math.sin(t * 4 + index) * 0.002;
        });
        pulses.forEach((pulse, index) => {
          const route = routes[index];
          const local = (t * (0.27 + index * 0.04) + index * 0.17) % 1;
          const scaled = local * (route.length - 1);
          const start = route[Math.floor(scaled)];
          const end = route[Math.min(route.length - 1, Math.floor(scaled) + 1)];
          pulse.position.copy(start).lerp(end, scaled % 1);
          pulse.scale.setScalar(1 + Math.sin(t * 9 + index) * 0.18);
        });
        rings.forEach((ring, index) => {
          ring.rotation.z = t * (0.8 + index * 0.28);
        });
        nodes.forEach((node, index) => {
          node.rotation.y += 0.008;
          node.position.y = routeTargets[index].y + Math.sin(t * 3 + index) * 0.04;
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
      verified.dispose();
      review.dispose();
      pending.dispose();
      consent.dispose();
      laneLine.dispose();
      gateLine.dispose();
      ghostLine.dispose();
      ringMaterial.dispose();
      nodeGeometry.dispose();
      gateGeometry.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}
