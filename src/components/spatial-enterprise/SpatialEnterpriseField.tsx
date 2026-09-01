"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function SpatialEnterpriseField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 140);
    camera.position.set(0, 4.9, 12.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.setAttribute("data-testid", "spatial-enterprise-canvas");
    renderer.domElement.setAttribute("aria-label", "Animated 3D Asset A17 spatial enterprise field");
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const graphite = new THREE.MeshBasicMaterial({ color: 0x8b98a8, transparent: true, opacity: 0.82 });
    const teal = new THREE.MeshBasicMaterial({ color: 0x48f2d2, transparent: true, opacity: 0.9 });
    const indigo = new THREE.MeshBasicMaterial({ color: 0x5667ff, transparent: true, opacity: 0.78 });
    const amber = new THREE.MeshBasicMaterial({ color: 0xffc857, transparent: true, opacity: 0.9 });
    const white = new THREE.MeshBasicMaterial({ color: 0xf8fbff, transparent: true, opacity: 0.86 });
    const surfaceLine = new THREE.LineBasicMaterial({ color: 0x48f2d2, transparent: true, opacity: 0.24 });
    const authorityLine = new THREE.LineBasicMaterial({ color: 0xffc857, transparent: true, opacity: 0.55 });
    const twinLine = new THREE.LineBasicMaterial({ color: 0x5667ff, transparent: true, opacity: 0.36 });

    const asset = new THREE.Group();
    group.add(asset);

    const base = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.45, 1.45), graphite);
    base.position.set(0, -0.35, 0);
    asset.add(base);

    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.95, 28), graphite);
    motor.rotation.z = Math.PI / 2;
    motor.position.set(-0.7, 0.28, 0);
    asset.add(motor);

    const chamber = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.25, 1.2), graphite);
    chamber.position.set(1.05, 0.28, 0);
    asset.add(chamber);

    const component = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 1), amber);
    component.position.set(1.06, 1.07, 0.02);
    asset.add(component);

    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.06, 1.56), teal);
    plate.position.set(1.05, 0.98, 0);
    asset.add(plate);

    const nodes: THREE.Mesh[] = [];
    const nodePoints: THREE.Vector3[] = [];
    for (let i = 0; i < 28; i += 1) {
      const angle = i * 0.54;
      const radius = 2.4 + (i % 4) * 0.38;
      const point = new THREE.Vector3(Math.cos(angle) * radius, Math.sin(i * 0.47) * 1.15 + 0.35, Math.sin(angle) * radius * 0.5);
      nodePoints.push(point);
      const node = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.11), i % 5 === 0 ? amber : i % 3 === 0 ? indigo : teal);
      node.position.copy(point);
      nodes.push(node);
      group.add(node);
    }

    nodePoints.forEach((point, index) => {
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([point, nodePoints[(index + 5) % nodePoints.length]]), index % 4 === 0 ? authorityLine : surfaceLine));
      if (index % 3 === 0) {
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([point, component.position]), twinLine));
      }
    });

    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x48f2d2, transparent: true, opacity: 0.23 });
    const authorityRingMaterial = new THREE.MeshBasicMaterial({ color: 0xffc857, transparent: true, opacity: 0.34 });
    const rings = [1.65, 2.65, 3.65].map((radius, index) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.01, 8, 180), index === 1 ? authorityRingMaterial : ringMaterial);
      ring.rotation.set(Math.PI / 2.35, 0.1 + index * 0.15, index * 0.35);
      ring.position.set(0.25, 0.2, -0.12);
      group.add(ring);
      return ring;
    });

    const labels = [
      new THREE.Vector3(-2.9, 1.9, 0.2),
      new THREE.Vector3(-1.4, 2.75, -0.35),
      new THREE.Vector3(1.3, 2.65, 0.28),
      new THREE.Vector3(3.1, 1.3, -0.18)
    ];
    labels.forEach((point, index) => {
      const beacon = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 1), index === 0 ? white : index === 2 ? amber : teal);
      beacon.position.copy(point);
      group.add(beacon);
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([point, component.position]), index === 2 ? authorityLine : surfaceLine));
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
      const t = performance.now() * 0.00038;
      if (!reduceMotion) {
        group.rotation.y = Math.sin(t * 0.55) * 0.22;
        group.rotation.x = -0.18 + Math.sin(t * 0.4) * 0.045;
        asset.rotation.y = Math.sin(t * 0.7) * 0.08;
        component.rotation.y = t * 2.2;
        component.rotation.x = t * 1.4;
        nodes.forEach((node, index) => {
          node.position.y = nodePoints[index].y + Math.sin(t * 4.3 + index * 0.4) * 0.045;
          node.rotation.y += 0.008;
        });
        rings.forEach((ring, index) => {
          ring.rotation.z = t * (0.7 + index * 0.32);
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
      graphite.dispose();
      teal.dispose();
      indigo.dispose();
      amber.dispose();
      white.dispose();
      surfaceLine.dispose();
      authorityLine.dispose();
      twinLine.dispose();
      ringMaterial.dispose();
      authorityRingMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}
