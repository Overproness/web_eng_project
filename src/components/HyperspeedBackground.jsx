import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./Hyperspeed.css";

const HyperspeedBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) {
      console.log("No container ref");
      return;
    }

    // console.log('HyperspeedBackground mounted, starting Three.js');

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 200, 2000);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      90,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    camera.position.set(0, 8, -5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // console.log('Renderer created and appended');

    // Create simple animated road with green theme
    const roadGeometry = new THREE.PlaneGeometry(10, 400);
    const roadMaterial = new THREE.MeshBasicMaterial({
      color: 0x0a1410,
      side: THREE.DoubleSide,
    });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.z = -200;
    scene.add(road);

    // Create car lights (green theme colors)
    const lights = [];
    const lightColors = [0x00ff88, 0x10b981, 0x22c55e, 0x34d399, 0x6ee7b7];

    // Add road lane markers
    const laneMarkers = [];
    for (let i = 0; i < 30; i++) {
      const markerGeometry = new THREE.BoxGeometry(0.2, 0.1, 2);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        transparent: true,
        opacity: 0.6,
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);

      marker.position.x = 0;
      marker.position.y = 0.05;
      marker.position.z = -i * 15;
      marker.rotation.x = -Math.PI / 2;

      scene.add(marker);
      laneMarkers.push(marker);
    }

    // Create light trails (car lights)
    for (let i = 0; i < 30; i++) {
      const geometry = new THREE.CylinderGeometry(0.15, 0.15, 1.5, 8);
      const material = new THREE.MeshBasicMaterial({
        color: lightColors[Math.floor(Math.random() * lightColors.length)],
        transparent: true,
        opacity: 0.9,
        emissive: lightColors[Math.floor(Math.random() * lightColors.length)],
        emissiveIntensity: 0.5,
      });
      const light = new THREE.Mesh(geometry, material);

      const lane = Math.random() > 0.5 ? 1 : -1;
      light.position.x = lane * (2 + Math.random() * 2);
      light.position.y = 0.3;
      light.position.z = -Math.random() * 400;
      light.rotation.x = Math.PI / 2;

      light.userData.speed = 80 + Math.random() * 60;
      light.userData.lane = lane;

      scene.add(light);
      lights.push(light);
    }

    // Add side sticks
    const sideSticks = [];
    for (let i = 0; i < 40; i++) {
      const stickGeometry = new THREE.BoxGeometry(0.1, 1.5, 0.1);
      const stickMaterial = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.7,
      });
      const stick = new THREE.Mesh(stickGeometry, stickMaterial);

      const side = Math.random() > 0.5 ? 1 : -1;
      stick.position.x = side * 6;
      stick.position.y = 0.75;
      stick.position.z = -i * 12;

      scene.add(stick);
      sideSticks.push(stick);
    }

    // Add floating particles
    const particles = [];
    const particleGeometry = new THREE.SphereGeometry(0.05, 4, 4);
    for (let i = 0; i < 50; i++) {
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: lightColors[Math.floor(Math.random() * lightColors.length)],
        transparent: true,
        opacity: 0.6,
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.x = (Math.random() - 0.5) * 15;
      particle.position.y = Math.random() * 10;
      particle.position.z = -Math.random() * 400;
      particle.userData.speed = 20 + Math.random() * 30;
      scene.add(particle);
      particles.push(particle);
    }

    // Animation
    const clock = new THREE.Clock();
    let animationId;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Camera sway animation
      camera.position.x = Math.sin(elapsedTime * 0.3) * 1.5;
      camera.position.y = 8 + Math.sin(elapsedTime * 0.5) * 0.5;
      camera.lookAt(0, 0, -100);

      // Move lane markers
      laneMarkers.forEach((marker) => {
        marker.position.z += 60 * delta;
        if (marker.position.z > 10) {
          marker.position.z = -400;
        }
        // Pulse opacity
        marker.material.opacity =
          0.4 + Math.sin(elapsedTime * 2 + marker.position.z * 0.1) * 0.2;
      });

      // Move side sticks with wave effect
      sideSticks.forEach((stick, index) => {
        stick.position.z += 60 * delta;
        if (stick.position.z > 10) {
          stick.position.z = -480;
        }
        stick.position.y = 0.75 + Math.sin(elapsedTime * 2 + index * 0.5) * 0.3;
      });

      // Move light trails
      lights.forEach((light) => {
        light.position.z += light.userData.speed * delta;

        // Add slight horizontal movement
        light.position.x +=
          Math.sin(elapsedTime + light.position.z * 0.01) * 0.02;

        if (light.position.z > 10) {
          light.position.z = -400;
          const lane = Math.random() > 0.5 ? 1 : -1;
          light.position.x = lane * (2 + Math.random() * 2);
          light.userData.lane = lane;
          // Change color occasionally
          if (Math.random() > 0.7) {
            light.material.color.setHex(
              lightColors[Math.floor(Math.random() * lightColors.length)]
            );
            light.material.emissive.setHex(
              lightColors[Math.floor(Math.random() * lightColors.length)]
            );
          }
        }
      });

      // Move particles
      particles.forEach((particle) => {
        particle.position.z += particle.userData.speed * delta;
        particle.position.y +=
          Math.sin(elapsedTime + particle.position.x) * 0.01;
        if (particle.position.z > 10) {
          particle.position.z = -400;
          particle.position.x = (Math.random() - 0.5) * 15;
        }
      });

      renderer.render(scene, camera);
    };

    animate();
    // console.log('Animation started');

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      // console.log('Cleaning up HyperspeedBackground');
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);

      if (
        containerRef.current &&
        renderer.domElement.parentNode === containerRef.current
      ) {
        containerRef.current.removeChild(renderer.domElement);
      }

      renderer.dispose();
      roadGeometry.dispose();
      roadMaterial.dispose();

      lights.forEach((light) => {
        light.geometry.dispose();
        light.material.dispose();
      });

      laneMarkers.forEach((marker) => {
        marker.geometry.dispose();
        marker.material.dispose();
      });

      sideSticks.forEach((stick) => {
        stick.geometry.dispose();
        stick.material.dispose();
      });

      particles.forEach((particle) => {
        particle.material.dispose();
      });
      particleGeometry.dispose();
    };
  }, []);

  return <div id="lights" ref={containerRef}></div>;
};

export default HyperspeedBackground;
