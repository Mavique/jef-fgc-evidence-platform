"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

function drawFallback(canvas: HTMLCanvasElement, width: number, height: number) {
  const ratio = Math.min(window.devicePixelRatio, 1.65);
  canvas.width = Math.max(1, Math.floor(width * ratio));
  canvas.height = Math.max(1, Math.floor(height * ratio));
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(84, 220, 255, 0.055)";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(84, 220, 255, 0.32)";
  ctx.lineWidth = 1.2;
  for (let index = 0; index < 8; index += 1) {
    const x = width * 0.12 + index * width * 0.1;
    const y = height * 0.5 + Math.sin(index * 0.7) * 38;
    ctx.strokeRect(x, y, width * 0.074, 34);
  }
  ctx.strokeStyle = "rgba(255, 196, 92, 0.5)";
  ctx.beginPath();
  ctx.moveTo(width * 0.08, height * 0.72);
  ctx.bezierCurveTo(width * 0.32, height * 0.4, width * 0.62, height * 0.86, width * 0.92, height * 0.54);
  ctx.stroke();
  ctx.fillStyle = "rgba(170, 255, 128, 0.88)";
  for (let index = 0; index < 6; index += 1) {
    ctx.beginPath();
    ctx.arc(width * 0.2 + index * width * 0.12, height * 0.28 + Math.cos(index) * 34, 6 + (index % 2) * 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function AiServicesField() {
  const mountRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    const fallback = fallbackRef.current;
    if (!mount || !fallback) return;

    const draw = () => drawFallback(fallback, mount.clientWidth, mount.clientHeight);
    draw();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 160);
    camera.position.set(0, 5.8, 12.8);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    } catch {
      window.addEventListener("resize", draw);
      return () => window.removeEventListener("resize", draw);
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.setAttribute("data-testid", "ai-services-webgl-canvas");
    renderer.domElement.setAttribute("aria-label", "Animated AI Services workbench system");
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const cyan = new THREE.MeshBasicMaterial({ color: 0x54dcff, transparent: true, opacity: 0.88 });
    const lime = new THREE.MeshBasicMaterial({ color: 0xaaff80, transparent: true, opacity: 0.82 });
    const amber = new THREE.MeshBasicMaterial({ color: 0xffc45a, transparent: true, opacity: 0.9 });
    const canopy = new THREE.MeshBasicMaterial({ color: 0x627bff, transparent: true, opacity: 0.72 });
    const paper = new THREE.MeshBasicMaterial({ color: 0xf6f8ff, transparent: true, opacity: 0.58 });
    const cyanLine = new THREE.LineBasicMaterial({ color: 0x54dcff, transparent: true, opacity: 0.28 });
    const amberLine = new THREE.LineBasicMaterial({ color: 0xffc45a, transparent: true, opacity: 0.44 });

    const workflow: THREE.Vector3[] = [];
    const nodes: THREE.Mesh[] = [];
    for (let index = 0; index < 10; index += 1) {
      const point = new THREE.Vector3(-4.8 + index * 1.07, Math.sin(index * 0.7) * 0.4, Math.cos(index * 0.62) * 0.5);
      workflow.push(point);
      const node = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 0.22), index < 3 ? paper : index < 7 ? cyan : lime);
      node.position.copy(point);
      nodes.push(node);
      group.add(node);
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(workflow), cyanLine));

    const gates: THREE.Mesh[] = [2, 4, 6, 8].map((nodeIndex, index) => {
      const gate = new THREE.Mesh(index === 2 ? new THREE.OctahedronGeometry(0.32, 1) : new THREE.IcosahedronGeometry(0.28, 1), index === 1 ? amber : canopy);
      gate.position.set(workflow[nodeIndex].x, workflow[nodeIndex].y + 1.15, workflow[nodeIndex].z);
      group.add(gate);
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([workflow[nodeIndex], gate.position]), amberLine));
      return gate;
    });

    const sourceOrbit = new THREE.Group();
    group.add(sourceOrbit);
    for (let index = 0; index < 24; index += 1) {
      const angle = index * 0.62;
      const radius = 1.1 + (index % 4) * 0.36;
      const source = new THREE.Mesh(new THREE.TetrahedronGeometry(0.095, 0), index % 5 === 0 ? amber : index % 3 === 0 ? lime : cyan);
      source.position.set(Math.cos(angle) * radius, 1.55 + Math.sin(index * 0.45) * 0.72, Math.sin(angle) * radius * 0.62);
      sourceOrbit.add(source);
      if (index % 3 === 0) group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([source.position, workflow[index % workflow.length]]), cyanLine));
    }

    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.6, -1.35, 1.3),
      new THREE.Vector3(-1.7, -0.55, 2.2),
      new THREE.Vector3(1.5, -0.8, 2.1),
      new THREE.Vector3(4.7, -1.25, 1.2)
    ]);
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(path.getPoints(64)), amberLine));
    const pulses: THREE.Mesh[] = [];
    for (let index = 0; index < 5; index += 1) {
      const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), index === 4 ? lime : cyan);
      pulses.push(pulse);
      group.add(pulse);
    }

    const resize = () => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      draw();
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
        group.rotation.y = Math.sin(t * 0.52) * 0.2;
        group.rotation.x = -0.08 + Math.sin(t * 0.38) * 0.045;
        nodes.forEach((node, index) => {
          node.rotation.y += 0.008;
          node.position.y = workflow[index].y + Math.sin(t * 4.2 + index) * 0.045;
        });
        gates.forEach((gate, index) => {
          gate.rotation.y += 0.012;
          gate.scale.setScalar(1 + Math.sin(t * 4.8 + index) * 0.08);
        });
        sourceOrbit.rotation.y = t * 0.42;
        pulses.forEach((pulse, index) => {
          const progress = (t * (0.18 + index * 0.025) + index * 0.18) % 1;
          pulse.position.copy(path.getPoint(progress));
        });
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      group.traverse((object) => {
        if ("geometry" in object && object.geometry instanceof THREE.BufferGeometry) object.geometry.dispose();
      });
      cyan.dispose();
      lime.dispose();
      amber.dispose();
      canopy.dispose();
      paper.dispose();
      cyanLine.dispose();
      amberLine.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="absolute inset-0">
      <canvas ref={fallbackRef} className="absolute inset-0 h-full w-full" data-testid="ai-services-canvas" aria-label="AI Services workbench field" />
      <div ref={mountRef} className="absolute inset-0" />
    </div>
  );
}
