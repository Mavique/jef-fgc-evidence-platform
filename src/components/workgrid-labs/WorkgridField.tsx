"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function WorkgridField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 120);
    camera.position.set(0, 3.2, 10.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.setAttribute("data-testid", "workgrid-canvas");
    renderer.domElement.setAttribute("aria-label", "Animated 3D workgrid routing field");
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const baseLine = new THREE.LineBasicMaterial({ color: 0x37f0dc, transparent: true, opacity: 0.2 });
    const hotLine = new THREE.LineBasicMaterial({ color: 0xffb84c, transparent: true, opacity: 0.46 });
    const cobalt = new THREE.MeshBasicMaterial({ color: 0x5b71ff, transparent: true, opacity: 0.9 });
    const teal = new THREE.MeshBasicMaterial({ color: 0x37f0dc, transparent: true, opacity: 0.9 });
    const amber = new THREE.MeshBasicMaterial({ color: 0xffb84c, transparent: true, opacity: 0.92 });

    const nodes: THREE.Mesh[] = [];
    const points: THREE.Vector3[] = [];

    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        const x = (col - 4) * 1.12;
        const z = (row - 2) * 1.08;
        const y = Math.sin((row + col) * 0.72) * 0.14;
        const point = new THREE.Vector3(x, y, z);
        points.push(point);

        const material = (row + col) % 5 === 0 ? amber : (row + col) % 3 === 0 ? cobalt : teal;
        const node = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.11), material);
        node.position.copy(point);
        node.rotation.set(row * 0.34, col * 0.21, 0.2);
        nodes.push(node);
        group.add(node);
      }
    }

    for (let index = 0; index < points.length; index += 1) {
      const col = index % 9;
      const row = Math.floor(index / 9);
      if (col < 8) group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([points[index], points[index + 1]]), baseLine));
      if (row < 4) group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([points[index], points[index + 9]]), baseLine));
      if (col < 7 && row < 3 && index % 4 === 0) group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([points[index], points[index + 19]]), hotLine));
    }

    const pathGeometry = new THREE.BufferGeometry().setFromPoints([
      points[2],
      points[12],
      points[23],
      points[31],
      points[40]
    ]);
    const path = new THREE.Line(pathGeometry, hotLine);
    group.add(path);

    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 1), amber);
    core.position.set(0, 0.52, 0);
    group.add(core);

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
        group.rotation.y = Math.sin(t * 0.8) * 0.14;
        group.rotation.x = -0.42 + Math.sin(t * 0.55) * 0.035;
        core.rotation.y = t * 3.4;
        core.rotation.x = t * 1.8;
        nodes.forEach((node, index) => {
          node.position.y = points[index].y + Math.sin(t * 4 + index * 0.37) * 0.05;
          node.rotation.y += 0.006;
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
      baseLine.dispose();
      hotLine.dispose();
      cobalt.dispose();
      teal.dispose();
      amber.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}
