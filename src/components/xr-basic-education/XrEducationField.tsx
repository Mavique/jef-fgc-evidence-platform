"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function XrEducationField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, mount.clientWidth / mount.clientHeight, 0.1, 140);
    camera.position.set(0, 2.8, 10.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.setAttribute("data-testid", "xr-basic-education-canvas");
    renderer.domElement.setAttribute("aria-label", "Animated 3D curriculum page transforming into immersive learning layers");
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const paper = new THREE.MeshBasicMaterial({ color: 0xf7fbff, transparent: true, opacity: 0.42 });
    const indigo = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.76 });
    const cyan = new THREE.MeshBasicMaterial({ color: 0x54dcff, transparent: true, opacity: 0.86 });
    const orange = new THREE.MeshBasicMaterial({ color: 0xffa45c, transparent: true, opacity: 0.92 });
    const green = new THREE.MeshBasicMaterial({ color: 0xaaff80, transparent: true, opacity: 0.88 });
    const line = new THREE.LineBasicMaterial({ color: 0x54dcff, transparent: true, opacity: 0.34 });
    const reviewLine = new THREE.LineBasicMaterial({ color: 0xffa45c, transparent: true, opacity: 0.46 });

    const page = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.06, 3.2), paper);
    page.position.set(-1.2, -0.45, 0);
    page.rotation.x = -0.58;
    group.add(page);

    const layers: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i += 1) {
      const layer = new THREE.Mesh(new THREE.BoxGeometry(3.8 - i * 0.24, 0.035, 2.3 - i * 0.16), i % 2 === 0 ? indigo : cyan);
      layer.position.set(-0.35 + i * 0.42, -0.02 + i * 0.34, -0.2 + i * 0.1);
      layer.rotation.x = -0.52 + i * 0.12;
      layer.rotation.z = i * 0.035;
      layers.push(layer);
      group.add(layer);
    }

    const routePoints = [
      new THREE.Vector3(-3.2, 1.4, 0.6),
      new THREE.Vector3(-1.8, 1.9, 0.1),
      new THREE.Vector3(-0.2, 2.15, -0.15),
      new THREE.Vector3(1.4, 1.9, 0.1),
      new THREE.Vector3(2.9, 1.2, 0.55)
    ];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(routePoints), reviewLine));

    const nodes: THREE.Mesh[] = routePoints.map((point, index) => {
      const node = new THREE.Mesh(index === 2 ? new THREE.IcosahedronGeometry(0.26, 1) : new THREE.SphereGeometry(0.16, 18, 18), index === 0 ? orange : index === 4 ? green : cyan);
      node.position.copy(point);
      group.add(node);
      return node;
    });

    const devicePositions = [
      new THREE.Vector3(-3.1, -1.6, 1.1),
      new THREE.Vector3(-1.6, -1.85, 0.5),
      new THREE.Vector3(0, -1.95, 0.2),
      new THREE.Vector3(1.7, -1.75, 0.45),
      new THREE.Vector3(3.1, -1.38, 1.05)
    ];
    const devices: THREE.Mesh[] = devicePositions.map((point, index) => {
      const device = new THREE.Mesh(new THREE.BoxGeometry(index === 3 ? 0.55 : 0.42, index === 3 ? 0.36 : 0.24, 0.08), index === 4 ? green : indigo);
      device.position.copy(point);
      device.rotation.x = -0.22;
      group.add(device);
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([point, routePoints[Math.min(index, routePoints.length - 1)]]), line));
      return device;
    });

    const rings = [1.3, 2.05, 2.8].map((radius, index) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.007, 8, 180), index === 1 ? reviewLine as unknown as THREE.Material : line as unknown as THREE.Material);
      ring.position.set(0.45, 0.35, 0);
      ring.rotation.set(Math.PI / 2.7, index * 0.22, index * 0.4);
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
        group.rotation.y = Math.sin(t * 0.52) * 0.18;
        group.rotation.x = Math.sin(t * 0.44) * 0.05;
        layers.forEach((layer, index) => {
          layer.position.y = -0.02 + index * 0.34 + Math.sin(t * 3.1 + index) * 0.035;
        });
        nodes.forEach((node, index) => {
          node.rotation.y += 0.012;
          node.scale.setScalar(1 + Math.sin(t * 5.2 + index) * 0.08);
        });
        devices.forEach((device, index) => {
          device.rotation.z = Math.sin(t * 2.4 + index) * 0.05;
        });
        rings.forEach((ring, index) => {
          ring.rotation.z = t * (0.58 + index * 0.23);
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
      paper.dispose();
      indigo.dispose();
      cyan.dispose();
      orange.dispose();
      green.dispose();
      line.dispose();
      reviewLine.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}
