import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './Hyperspeed.css';

const HyperspeedBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) {
      console.log('No container ref');
      return;
    }

    console.log('HyperspeedBackground mounted, starting Three.js');

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

    console.log('Renderer created and appended');

    // Create simple animated road
    const roadGeometry = new THREE.PlaneGeometry(10, 400);
    const roadMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x101010,
      side: THREE.DoubleSide 
    });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.z = -200;
    scene.add(road);

    // Create car lights (simple spheres for now)
    const lights = [];
    const lightColors = [0xff0080, 0x00ffff, 0xff00ff, 0x00ff88];
    
    for (let i = 0; i < 20; i++) {
      const geometry = new THREE.SphereGeometry(0.2, 8, 8);
      const material = new THREE.MeshBasicMaterial({ 
        color: lightColors[Math.floor(Math.random() * lightColors.length)],
        transparent: true,
        opacity: 0.8
      });
      const light = new THREE.Mesh(geometry, material);
      
      light.position.x = (Math.random() - 0.5) * 8;
      light.position.y = Math.random() * 2;
      light.position.z = -Math.random() * 400;
      
      light.userData.speed = 50 + Math.random() * 50;
      
      scene.add(light);
      lights.push(light);
    }

    // Animation
    const clock = new THREE.Clock();
    let animationId;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const delta = clock.getDelta();
      
      // Move lights
      lights.forEach(light => {
        light.position.z += light.userData.speed * delta;
        
        if (light.position.z > 10) {
          light.position.z = -400;
          light.position.x = (Math.random() - 0.5) * 8;
        }
      });
      
      renderer.render(scene, camera);
    };

    animate();
    console.log('Animation started');

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      console.log('Cleaning up HyperspeedBackground');
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      roadGeometry.dispose();
      roadMaterial.dispose();
      lights.forEach(light => {
        light.geometry.dispose();
        light.material.dispose();
      });
    };
  }, []);

  return <div id="lights" ref={containerRef}></div>;
};

export default HyperspeedBackground;
