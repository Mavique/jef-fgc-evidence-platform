"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function TvetXrLabField() {
  const mountRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    const fallback = fallbackRef.current;
    if (!mount) return;

    const drawFallback = () => {
      if (!fallback) return;
      const ratio = Math.min(window.devicePixelRatio, 1.65);
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      fallback.width = Math.floor(width * ratio);
      fallback.height = Math.floor(height * ratio);
      fallback.style.width = "100%";
      fallback.style.height = "100%";

      const ctx = fallback.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(45, 212, 191, 0.08)";
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(45, 212, 191, 0.38)";
      ctx.lineWidth = 1.2;
      for (let index = 0; index < 7; index += 1) {
        const x = width * 0.16 + index * width * 0.095;
        const y = height * 0.54 + Math.sin(index) * 26;
        ctx.strokeRect(x, y, width * 0.07, 32);
      }
      ctx.strokeStyle = "rgba(217, 119, 6, 0.52)";
      ctx.beginPath();
      ctx.moveTo(width * 0.08, height * 0.76);
      ctx.bezierCurveTo(width * 0.32, height * 0.58, width * 0.62, height * 0.92, width * 0.92, height * 0.68);
      ctx.stroke();
      ctx.fillStyle = "rgba(45, 212, 191, 0.85)";
      for (let index = 0; index < 6; index += 1) {
        ctx.beginPath();
        ctx.arc(width * 0.16 + index * width * 0.105, height * 0.34 + Math.sin(index * 0.8) * 32, index === 0 ? 9 : 6, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawFallback();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 160);
    camera.position.set(0, 6.4, 12.5);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.setAttribute("data-testid", "tvet-xr-lab-webgl-canvas");
    renderer.domElement.setAttribute("aria-label", "Animated 3D XR Lab capability system assembling around occupational practice");
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const teal = new THREE.MeshBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.86 });
    const deepTeal = new THREE.MeshBasicMaterial({ color: 0x0d9488, transparent: true, opacity: 0.72 });
    const amber = new THREE.MeshBasicMaterial({ color: 0xd97706, transparent: true, opacity: 0.92 });
    const violet = new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.76 });
    const white = new THREE.MeshBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.62 });
    const zoneLine = new THREE.LineBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.32 });
    const evidenceLine = new THREE.LineBasicMaterial({ color: 0xd97706, transparent: true, opacity: 0.5 });

    const floor = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.05, 4.8), deepTeal);
    floor.position.set(0, -0.82, 0);
    floor.rotation.x = -0.04;
    group.add(floor);

    const zonePositions = [
      new THREE.Vector3(-2.8, -0.45, -1.25),
      new THREE.Vector3(-0.95, -0.38, -1.3),
      new THREE.Vector3(0.95, -0.38, -1.3),
      new THREE.Vector3(2.8, -0.45, -1.25),
      new THREE.Vector3(-2.5, -0.42, 1.05),
      new THREE.Vector3(0, -0.35, 1.18),
      new THREE.Vector3(2.5, -0.42, 1.05)
    ];
    const zones: THREE.Mesh[] = zonePositions.map((point, index) => {
      const zone = new THREE.Mesh(new THREE.BoxGeometry(index === 5 ? 1.8 : 1.18, 0.16, 0.9), index % 3 === 0 ? teal : index % 3 === 1 ? violet : white);
      zone.position.copy(point);
      group.add(zone);
      return zone;
    });

    for (let index = 0; index < zonePositions.length - 1; index += 1) {
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([zonePositions[index], zonePositions[index + 1]]), zoneLine));
    }

    const layerPoints = [
      new THREE.Vector3(-3.6, 1.2, 0),
      new THREE.Vector3(-2.1, 1.72, -0.15),
      new THREE.Vector3(-0.6, 2.06, -0.22),
      new THREE.Vector3(0.9, 2.05, -0.18),
      new THREE.Vector3(2.35, 1.62, -0.1),
      new THREE.Vector3(3.55, 0.95, 0.08)
    ];
    const layerNodes: THREE.Mesh[] = layerPoints.map((point, index) => {
      const node = new THREE.Mesh(index === 0 ? new THREE.OctahedronGeometry(0.28, 1) : new THREE.IcosahedronGeometry(0.2, 1), index === 0 ? amber : index === 5 ? teal : white);
      node.position.copy(point);
      group.add(node);
      if (index > 0) group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([layerPoints[index - 1], point]), evidenceLine));
      return node;
    });

    const bridgeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.25, -1.75, 1.5),
      new THREE.Vector3(-1.35, -1.25, 2.25),
      new THREE.Vector3(0.85, -1.2, 2.3),
      new THREE.Vector3(3.25, -1.75, 1.55)
    ]);
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(bridgeCurve.getPoints(50)), evidenceLine));

    const pulses: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i += 1) {
      const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), i === 4 ? amber : teal);
      pulses.push(pulse);
      group.add(pulse);
    }

    const rings = [1.35, 2.25, 3.15].map((radius, index) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.008, 8, 180), index === 1 ? evidenceLine as unknown as THREE.Material : zoneLine as unknown as THREE.Material);
      ring.position.set(0, 0.15, 0);
      ring.rotation.set(Math.PI / 2.55, index * 0.2, index * 0.52);
      group.add(ring);
      return ring;
    });

    const resize = () => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      drawFallback();
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", resize);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = performance.now() * 0.00038;
      if (!reduceMotion) {
        group.rotation.y = Math.sin(t * 0.55) * 0.18;
        group.rotation.x = Math.sin(t * 0.42) * 0.045;
        zones.forEach((zone, index) => {
          zone.position.y = zonePositions[index].y + Math.sin(t * 3.2 + index) * 0.035;
          zone.rotation.y = Math.sin(t * 2.1 + index) * 0.06;
        });
        layerNodes.forEach((node, index) => {
          node.rotation.y += 0.012;
          node.scale.setScalar(1 + Math.sin(t * 4.5 + index) * 0.08);
        });
        pulses.forEach((pulse, index) => {
          const progress = (t * (0.16 + index * 0.02) + index * 0.18) % 1;
          pulse.position.copy(bridgeCurve.getPoint(progress));
          pulse.scale.setScalar(1 + Math.sin(t * 8 + index) * 0.12);
        });
        rings.forEach((ring, index) => {
          ring.rotation.z = t * (0.54 + index * 0.24);
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
      deepTeal.dispose();
      amber.dispose();
      violet.dispose();
      white.dispose();
      zoneLine.dispose();
      evidenceLine.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="absolute inset-0">
      <canvas
        ref={fallbackRef}
        className="absolute inset-0 h-full w-full"
        data-testid="tvet-xr-lab-canvas"
        aria-label="XR Lab capability field"
      />
      <div ref={mountRef} className="absolute inset-0" />
    </div>
  );
}
