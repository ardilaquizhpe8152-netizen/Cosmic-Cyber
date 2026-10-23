<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Cosmic Cyber Rush 3D</title>
    <!-- Tailwind CSS for UI styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Three.js for 3D graphics rendering -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@500;700&display=swap');

        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #050515;
            font-family: 'Rajdhani', sans-serif;
            user-select: none;
            -webkit-user-select: none;
        }

        .font-orbitron {
            font-family: 'Orbitron', sans-serif;
        }

        /* Neon Glow Effects */
        .glow-text-cyan {
            text-shadow: 0 0 10px rgba(0, 243, 255, 0.7), 0 0 20px rgba(0, 243, 255, 0.5);
        }
        .glow-text-pink {
            text-shadow: 0 0 10px rgba(255, 0, 127, 0.7), 0 0 20px rgba(255, 0, 127, 0.5);
        }
        .glow-box-cyan {
            box-shadow: 0 0 15px rgba(0, 243, 255, 0.4), inset 0 0 15px rgba(0, 243, 255, 0.2);
            border: 1px solid rgba(0, 243, 255, 0.6);
        }
        .glow-box-pink {
            box-shadow: 0 0 15px rgba(255, 0, 127, 0.4), inset 0 0 15px rgba(255, 0, 127, 0.2);
            border: 1px solid rgba(255, 0, 127, 0.6);
        }

        /* Custom Scrollbar & Canvas setup */
        #game-canvas {
            display: block;
            width: 100vw;
            height: 100vh;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
        }

        #ui-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10;
            pointer-events: none;
        }

        .pointer-auto {
            pointer-events: auto;
        }

        /* Touch control zone overlays */
        .touch-zone {
            position: absolute;
            bottom: 20px;
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(0, 243, 255, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #00f3ff;
            font-size: 24px;
            backdrop-filter: blur(4px);
            touch-action: manipulation;
        }
        .touch-zone:active {
            background: rgba(0, 243, 255, 0.4);
        }
    </style>
</head>
<body class="bg-black text-white overflow-hidden">

    <!-- 3D Render Canvas -->
    <canvas id="game-canvas"></canvas>

    <!-- UI Overlay Layer -->
    <div id="ui-layer" class="flex flex-col justify-between p-4 sm:p-6">
        
        <!-- HUD (Heads-Up Display) - Visible during gameplay -->
        <div id="hud" class="hidden flex justify-between items-start w-full max-w-5xl mx-auto">
            <!-- Score & Multiplier -->
            <div class="bg-slate-900/80 backdrop-blur-md p-3 sm:p-4 rounded-xl glow-box-cyan flex flex-col">
                <span class="text-xs uppercase tracking-widest text-cyan-400 font-bold">Puntuación</span>
                <span id="score-text" class="text-2xl sm:text-4xl font-black font-orbitron text-white">0</span>
                <span id="multiplier-text" class="text-xs font-bold text-pink-500 mt-1">MULTI: x1.0</span>
            </div>

            <!-- Health Bar & Collectibles -->
            <div class="flex flex-col items-end gap-2">
                <div class="bg-slate-900/80 backdrop-blur-md p-3 sm:p-4 rounded-xl glow-box-pink min-w-[160px]">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-xs uppercase tracking-widest text-pink-400 font-bold">Escudo</span>
                        <span id="hp-text" class="text-xs font-bold text-white">100%</span>
                    </div>
                    <!-- Shield Progress Bar -->
                    <div class="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-pink-500/30">
                        <div id="hp-bar" class="bg-gradient-to-r from-pink-500 to-cyan-400 h-full w-full transition-all duration-300"></div>
                    </div>
                </div>

                <!-- Energy Orbs Count -->
                <div class="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-lg border border-yellow-500/40 flex items-center gap-2">
                    <i class="fa-solid fa-bolt text-yellow-400 animate-pulse"></i>
                    <span id="orbs-text" class="font-orbitron font-bold text-yellow-400">0</span>
                </div>
            </div>
        </div>

        <!-- Touch Controls (Visible on mobile/tablets) -->
        <div id="touch-controls" class="sm:hidden hidden pointer-auto relative w-full h-32">
            <div id="btn-left" class="touch-zone left-4"><i class="fa-solid fa-arrow-left"></i></div>
            <div id="btn-right" class="touch-zone right-4"><i class="fa-solid fa-arrow-right"></i></div>
            <div id="btn-up" class="touch-zone left-1/2 -translate-x-1/2 -top-4"><i class="fa-solid fa-arrow-up"></i></div>
        </div>

        <!-- Start Menu Overlay -->
        <div id="start-menu" class="pointer-auto absolute inset-0 flex items-center justify-center bg-black/75 backdrop-blur-md">
            <div class="bg-slate-900/90 p-8 sm:p-10 rounded-2xl glow-box-cyan max-w-md w-11/12 text-center flex flex-col items-center">
                <h1 class="text-4xl sm:text-5xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400 mb-2 glow-text-cyan">
                    COSMIC RUSH
                </h1>
                <p class="text-slate-300 mb-6 text-sm sm:text-base">Esquiva obstáculos Synthwave, recoge orbes de energía y sobrevive en la autopista cósmica.</p>
                
                <div class="w-full bg-slate-800/80 rounded-lg p-4 mb-6 text-left text-xs sm:text-sm text-slate-300 space-y-2 border border-slate-700">
                    <div class="flex items-center gap-2"><i class="fa-solid fa-keyboard text-cyan-400 text-lg"></i> <span><b>Controles:</b> Flechas / A, D (Izq/Der), Espacio / W (Salto)</span></div>
                    <div class="flex items-center gap-2"><i class="fa-solid fa-shield-halved text-pink-400 text-lg"></i> <span><b>Escudo:</b> Pierdes energía al chocar.</span></div>
                    <div class="flex items-center gap-2"><i class="fa-solid fa-bolt text-yellow-400 text-lg"></i> <span><b>Orbes:</b> Suman puntos y restauran energía.</span></div>
                </div>

                <button id="start-btn" class="w-full py-4 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 font-orbitron font-bold text-lg rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 text-white glow-text-cyan">
                    INICIAR MISIÓN
                </button>
            </div>
        </div>

        <!-- Game Over Menu Overlay -->
        <div id="game-over-menu" class="hidden pointer-auto absolute inset-0 flex items-center justify-center bg-black/85 backdrop-blur-md">
            <div class="bg-slate-900/90 p-8 sm:p-10 rounded-2xl glow-box-pink max-w-md w-11/12 text-center flex flex-col items-center">
                <h2 class="text-4xl font-black font-orbitron text-red-500 mb-2 glow-text-pink">MISIÓN FALLIDA</h2>
                <p class="text-slate-400 text-sm mb-6">Tu nave sufrió demasiados daños en el sector.</p>
                
                <div class="w-full bg-slate-800/60 rounded-xl p-4 mb-6 space-y-3 border border-slate-700">
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-slate-400">Puntuación Final:</span>
                        <span id="final-score" class="font-orbitron font-bold text-cyan-400 text-xl">0</span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-slate-400">Orbes Recolectados:</span>
                        <span id="final-orbs" class="font-orbitron font-bold text-yellow-400 text-xl">0</span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-slate-400">Récord Personal:</span>
                        <span id="high-score" class="font-orbitron font-bold text-pink-500 text-xl">0</span>
                    </div>
                </div>

                <button id="restart-btn" class="w-full py-4 bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 font-orbitron font-bold text-lg rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 text-white glow-text-pink">
                    REINTENTAR
                </button>
            </div>
        </div>
    </div>

    <!-- MAIN GAME SCRIPT -->
    <script>
        /**
         * Web Audio API Synthesizer Module for Retro Sound Effects
         */
        class SoundFX {
            constructor() {
                this.ctx = null;
            }

            init() {
                if (!this.ctx) {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    this.ctx = new AudioContext();
                }
            }

            // Synth Pickup Sound Effect
            playPickup() {
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                
                const now = this.ctx.currentTime;
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15); // C6
                
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start(now);
                osc.stop(now + 0.15);
            }

            // Synth Hit/Collision Sound Effect
            playHit() {
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                
                const now = this.ctx.currentTime;
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
                
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start(now);
                osc.stop(now + 0.25);
            }

            // Synth Jump Sound Effect
            playJump() {
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                
                const now = this.ctx.currentTime;
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.linearRampToValueAtTime(600, now + 0.2);
                
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start(now);
                osc.stop(now + 0.2);
            }
        }

        const audio = new SoundFX();

        /**
         * Game Constants & Configurations
         */
        const CONFIG = {
            lanes: [-3.5, 0, 3.5], // 3 Lanes (Left, Center, Right)
            baseSpeed: 0.45,
            maxSpeed: 0.95,
            speedInc: 0.0001,
            jumpForce: 0.28,
            gravity: 0.014,
            spawnInterval: 45, // Frames between spawning objects
            cameraOffset: new THREE.Vector3(0, 3.5, 7.5)
        };

        /**
         * Main Game State Engine
         */
        class Game {
            constructor() {
                this.canvas = document.getElementById('game-canvas');
                this.scoreText = document.getElementById('score-text');
                this.multiplierText = document.getElementById('multiplier-text');
                this.hpText = document.getElementById('hp-text');
                this.hpBar = document.getElementById('hp-bar');
                this.orbsText = document.getElementById('orbs-text');
                
                this.startMenu = document.getElementById('start-menu');
                this.gameOverMenu = document.getElementById('game-over-menu');
                this.hud = document.getElementById('hud');
                this.touchControls = document.getElementById('touch-controls');

                this.isRunning = false;
                this.score = 0;
                this.orbsCount = 0;
                this.hp = 100;
                this.currentLane = 1; // Center lane index
                this.speed = CONFIG.baseSpeed;
                this.frameCount = 0;
                this.highScore = localStorage.getItem('cosmic_high_score') || 0;

                // Player Physics State
                this.playerPos = new THREE.Vector3(0, 0.6, 0);
                this.playerVelocityY = 0;
                this.isJumping = false;

                // Object Arrays
                this.obstacles = [];
                this.collectibles = [];
                this.particles = [];
                this.environmentDetails = [];

                this.initThreeJS();
                this.createWorld();
                this.createPlayer();
                this.bindEvents();

                // Start Render Loop
                this.animate = this.animate.bind(this);
                requestAnimationFrame(this.animate);
            }

            initThreeJS() {
                // Scene setup
                this.scene = new THREE.Scene();
                this.scene.background = new THREE.Color(0x050515);
                this.scene.fog = new THREE.FogExp2(0x050515, 0.035);

                // Camera setup
                this.camera = new THREE.PerspectiveCamera(
                    65,
                    window.innerWidth / window.innerHeight,
                    0.1,
                    1000
                );
                this.camera.position.copy(CONFIG.cameraOffset);
                this.camera.lookAt(0, 1, -5);

                // Renderer setup
                this.renderer = new THREE.WebGLRenderer({
                    canvas: this.canvas,
                    antialias: true,
                    powerPreference: "high-performance"
                });
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

                // Lights Setup
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
                this.scene.add(ambientLight);

                const dirLight = new THREE.DirectionalLight(0x00f3ff, 1.2);
                dirLight.position.set(10, 20, 10);
                dirLight.castShadow = true;
                dirLight.shadow.mapSize.width = 1024;
                dirLight.shadow.mapSize.height = 1024;
                this.scene.add(dirLight);

                const pinkLight = new THREE.PointLight(0xff007f, 2, 30);
                pinkLight.position.set(0, 5, -10);
                this.scene.add(pinkLight);
            }

            createWorld() {
                // Synthwave Grid Highway (Floor)
                const highwayWidth = 12;
                const highwayLength = 200;
                
                const gridTexture = this.generateGridTexture();
                gridTexture.wrapS = THREE.RepeatWrapping;
                gridTexture.wrapT = THREE.RepeatWrapping;
                gridTexture.repeat.set(1, 40);

                const highwayGeo = new THREE.PlaneGeometry(highwayWidth, highwayLength);
                const highwayMat = new THREE.MeshStandardMaterial({
                    map: gridTexture,
                    roughness: 0.2,
                    metalness: 0.5,
                    emissive: 0x001122,
                    emissiveIntensity: 0.2
                });

                this.highway = new THREE.Mesh(highwayGeo, highwayMat);
                this.highway.rotation.x = -Math.PI / 2;
                this.highway.position.z = -highwayLength / 2 + 10;
                this.highway.receiveShadow = true;
                this.scene.add(this.highway);

                // Neon Side Rails
                const railGeo = new THREE.BoxGeometry(0.3, 0.4, highwayLength);
                const railMat = new THREE.MeshStandardMaterial({
                    color: 0x00f3ff,
                    emissive: 0x00f3ff,
                    emissiveIntensity: 0.8
                });

                const leftRail = new THREE.Mesh(railGeo, railMat);
                leftRail.position.set(-highwayWidth / 2, 0.2, -highwayLength / 2 + 10);
                this.scene.add(leftRail);

                const rightRail = leftRail.clone();
                rightRail.position.x = highwayWidth / 2;
                this.scene.add(rightRail);

                // Background Sun Synthwave Retro
                const sunGeo = new THREE.CircleGeometry(18, 32);
                const sunMat = new THREE.MeshBasicMaterial({
                    color: 0xff007f,
                    fog: false
                });
                const sun = new THREE.Mesh(sunGeo, sunMat);
                sun.position.set(0, 8, -90);
                this.scene.add(sun);

                // Starfield Background Particles
                const starsGeo = new THREE.BufferGeometry();
                const starCount = 600;
                const starPositions = new Float32Array(starCount * 3);

                for (let i = 0; i < starCount * 3; i += 3) {
                    starPositions[i] = (Math.random() - 0.5) * 150;
                    starPositions[i + 1] = Math.random() * 50 + 2;
                    starPositions[i + 2] = -Math.random() * 100 - 10;
                }

                starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
                const starsMat = new THREE.PointsMaterial({
                    color: 0xffffff,
                    size: 0.4,
                    transparent: true,
                    opacity: 0.8
                });

                const starField = new THREE.Points(starsGeo, starsMat);
                this.scene.add(starField);
            }

            // Procedurally generated canvas texture for retro grid
            generateGridTexture() {
                const canvas = document.createElement('canvas');
                canvas.width = 256;
                canvas.height = 256;
                const ctx = canvas.getContext('2d');

                ctx.fillStyle = '#0a0a20';
                ctx.fillRect(0, 0, 256, 256);

                ctx.strokeStyle = '#00f3ff';
                ctx.lineWidth = 4;

                // Draw vertical lane grid lines
                ctx.beginPath();
                ctx.moveTo(0, 0); ctx.lineTo(0, 256);
                ctx.moveTo(85, 0); ctx.lineTo(85, 256);
                ctx.moveTo(170, 0); ctx.lineTo(170, 256);
                ctx.moveTo(256, 0); ctx.lineTo(256, 256);
                ctx.stroke();

                // Draw horizontal grid lines
                ctx.strokeStyle = '#ff007f';
                ctx.lineWidth = 2;
                for (let y = 0; y <= 256; y += 32) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(256, y);
                    ctx.stroke();
                }

                const texture = new THREE.CanvasTexture(canvas);
                return texture;
            }

            createPlayer() {
                // Cyberpunk Futuristic Spaceship Construction
                this.playerGroup = new THREE.Group();

                // Ship Fuselage
                const bodyGeo = new THREE.ConeGeometry(0.6, 2.2, 5);
                const bodyMat = new THREE.MeshStandardMaterial({
                    color: 0x151525,
                    metalness: 0.8,
                    roughness: 0.2,
                    flatShading: true
                });
                const body = new THREE.Mesh(bodyGeo, bodyMat);
                body.rotation.x = Math.PI / 2;
                body.castShadow = true;
                this.playerGroup.add(body);

                // Wings
                const wingGeo = new THREE.BoxGeometry(2.2, 0.08, 0.8);
                const wingMat = new THREE.MeshStandardMaterial({
                    color: 0x00f3ff,
                    emissive: 0x00f3ff,
                    emissiveIntensity: 0.5
                });
                const wings = new THREE.Mesh(wingGeo, wingMat);
                wings.position.set(0, -0.1, 0.3);
                wings.castShadow = true;
                this.playerGroup.add(wings);

                // Cockpit Glow
                const cockpitGeo = new THREE.SphereGeometry(0.3, 16, 16);
                const cockpitMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
                const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
                cockpit.position.set(0, 0.2, -0.2);
                cockpit.scale.set(1, 0.6, 1.5);
                this.playerGroup.add(cockpit);

                // Engine Thruster Glow
                const engineGeo = new THREE.CylinderGeometry(0.2, 0.05, 0.4, 12);
                const engineMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
                const engine = new THREE.Mesh(engineGeo, engineMat);
                engine.rotation.x = Math.PI / 2;
                engine.position.set(0, 0, 1.1);
                this.playerGroup.add(engine);

                this.playerGroup.position.copy(this.playerPos);
                this.scene.add(this.playerGroup);
            }

            // Bind Keyboard and Touch Events
            bindEvents() {
                window.addEventListener('resize', () => this.onWindowResize());

                // Keyboard controls
                window.addEventListener('keydown', (e) => {
                    if (!this.isRunning) return;

                    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                        this.moveLane(-1);
                    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                        this.moveLane(1);
                    } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
                        this.jump();
                    }
                });

                // UI Buttons
                document.getElementById('start-btn').addEventListener('click', () => {
                    audio.init();
                    this.startGame();
                });

                document.getElementById('restart-btn').addEventListener('click', () => {
                    audio.init();
                    this.restartGame();
                });

                // Touch Controls
                document.getElementById('btn-left').addEventListener('touchstart', (e) => { e.preventDefault(); this.moveLane(-1); });
                document.getElementById('btn-right').addEventListener('touchstart', (e) => { e.preventDefault(); this.moveLane(1); });
                document.getElementById('btn-up').addEventListener('touchstart', (e) => { e.preventDefault(); this.jump(); });
            }

            moveLane(direction) {
                const targetLane = THREE.MathUtils.clamp(this.currentLane + direction, 0, 2);
                if (targetLane !== this.currentLane) {
                    this.currentLane = targetLane;
                }
            }

            jump() {
                if (!this.isJumping) {
                    this.isJumping = true;
                    this.playerVelocityY = CONFIG.jumpForce;
                    audio.playJump();
                    this.createEngineParticles(15);
                }
            }

            startGame() {
                this.startMenu.classList.add('hidden');
                this.hud.classList.remove('hidden');
                if ('ontouchstart' in window) {
                    this.touchControls.classList.remove('hidden');
                }
                this.resetState();
                this.isRunning = true;
            }

            restartGame() {
                this.gameOverMenu.classList.add('hidden');
                this.resetState();
                this.isRunning = true;
            }

            resetState() {
                this.score = 0;
                this.orbsCount = 0;
                this.hp = 100;
                this.speed = CONFIG.baseSpeed;
                this.currentLane = 1;
                this.playerPos.set(CONFIG.lanes[1], 0.6, 0);
                this.playerVelocityY = 0;
                this.isJumping = false;

                // Clear active obstacles & collectibles
                this.obstacles.forEach(obs => this.scene.remove(obs.mesh));
                this.collectibles.forEach(col => this.scene.remove(col.mesh));
                this.particles.forEach(p => this.scene.remove(p.mesh));
                
                this.obstacles = [];
                this.collectibles = [];
                this.particles = [];

                this.updateHUD();
            }

            gameOver() {
                this.isRunning = false;
                audio.playHit();

                if (this.score > this.highScore) {
                    this.highScore = Math.floor(this.score);
                    localStorage.setItem('cosmic_high_score', this.highScore);
                }

                document.getElementById('final-score').innerText = Math.floor(this.score);
                document.getElementById('final-orbs').innerText = this.orbsCount;
                document.getElementById('high-score').innerText = this.highScore;

                this.gameOverMenu.classList.remove('hidden');
            }

            /**
             * Procedural Object Spawners
             */
            spawnObjects() {
                if (this.frameCount % Math.max(20, Math.floor(CONFIG.spawnInterval - (this.speed * 20))) === 0) {
                    const lane = Math.floor(Math.random() * 3);
                    const spawnZ = -80;

                    // 65% chance obstacle, 35% chance orb collectible
                    if (Math.random() < 0.65) {
                        this.spawnObstacle(lane, spawnZ);
                    } else {
                        this.spawnCollectible(lane, spawnZ);
                    }
                }
            }

            spawnObstacle(lane, z) {
                const type = Math.random() > 0.5 ? 'barrier' : 'cube';
                let mesh;

                if (type === 'barrier') {
                    // Holographic Energy Barrier
                    const geo = new THREE.BoxGeometry(2.8, 1.2, 0.4);
                    const mat = new THREE.MeshStandardMaterial({
                        color: 0xff0055,
                        emissive: 0xff0055,
                        emissiveIntensity: 0.8,
                        transparent: true,
                        opacity: 0.85
                    });
                    mesh = new THREE.Mesh(geo, mat);
                    mesh.position.set(CONFIG.lanes[lane], 0.6, z);
                } else {
                    // Cyber Prism Pyramid
                    const geo = new THREE.ConeGeometry(1.2, 1.8, 4);
                    const mat = new THREE.MeshStandardMaterial({
                        color: 0xff3300,
                        roughness: 0.3,
                        metalness: 0.7,
                        wireframe: false
                    });
                    mesh = new THREE.Mesh(geo, mat);
                    mesh.position.set(CONFIG.lanes[lane], 0.9, z);
                }

                mesh.castShadow = true;
                this.scene.add(mesh);
                this.obstacles.push({ mesh, type, lane, radius: 0.9 });
            }

            spawnCollectible(lane, z) {
                // Floating Glowing Energy Orb
                const geo = new THREE.IcosahedronGeometry(0.5, 2);
                const mat = new THREE.MeshStandardMaterial({
                    color: 0xffcc00,
                    emissive: 0xffaa00,
                    emissiveIntensity: 1,
                    roughness: 0.1
                });

                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(CONFIG.lanes[lane], 1.0, z);
                
                this.scene.add(mesh);
                this.collectibles.push({ mesh, lane, radius: 0.8, rotSpeed: Math.random() * 0.05 + 0.02 });
            }

            createExplosionParticles(pos, colorHex) {
                for (let i = 0; i < 20; i++) {
                    const geo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
                    const mat = new THREE.MeshBasicMaterial({ color: colorHex });
                    const mesh = new THREE.Mesh(geo, mat);
                    
                    mesh.position.copy(pos);
                    const velocity = new THREE.Vector3(
                        (Math.random() - 0.5) * 0.4,
                        Math.random() * 0.3 + 0.1,
                        (Math.random() - 0.5) * 0.4
                    );

                    this.scene.add(mesh);
                    this.particles.push({ mesh, velocity, life: 1.0, decay: Math.random() * 0.04 + 0.02 });
                }
            }

            createEngineParticles(count = 1) {
                for (let i = 0; i < count; i++) {
                    const geo = new THREE.SphereGeometry(0.08, 8, 8);
                    const mat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.8 });
                    const mesh = new THREE.Mesh(geo, mat);

                    mesh.position.set(
                        this.playerGroup.position.x + (Math.random() - 0.5) * 0.3,
                        this.playerGroup.position.y - 0.2,
                        this.playerGroup.position.z + 1.2
                    );

                    const velocity = new THREE.Vector3(
                        (Math.random() - 0.5) * 0.05,
                        -0.02,
                        Math.random() * 0.1 + 0.2
                    );

                    this.scene.add(mesh);
                    this.particles.push({ mesh, velocity, life: 1.0, decay: 0.05 });
                }
            }

            /**
             * Main Frame Update & Physics Loop
             */
            update() {
                if (!this.isRunning) return;

                this.frameCount++;
                this.speed = Math.min(CONFIG.maxSpeed, this.speed + CONFIG.speedInc);
                this.score += this.speed * 2;

                // Player Lateral Smooth Interpolation Movement
                const targetX = CONFIG.lanes[this.currentLane];
                this.playerPos.x += (targetX - this.playerPos.x) * 0.2;

                // Player Jump & Gravity Physics
                if (this.isJumping) {
                    this.playerPos.y += this.playerVelocityY;
                    this.playerVelocityY -= CONFIG.gravity;

                    if (this.playerPos.y <= 0.6) {
                        this.playerPos.y = 0.6;
                        this.isJumping = false;
                        this.playerVelocityY = 0;
                    }
                }

                // Update Player Mesh Position & Bank Rotation angle
                this.playerGroup.position.copy(this.playerPos);
                const bankAngle = (this.playerPos.x - targetX) * 0.25;
                this.playerGroup.rotation.z = bankAngle;
                this.playerGroup.rotation.x = this.isJumping ? -0.15 : 0;

                // Thruster particle trail
                if (this.frameCount % 2 === 0) {
                    this.createEngineParticles(1);
                }

                // Animate Highway UV Texture for Speed Effect
                this.highway.material.map.offset.y -= this.speed * 0.08;

                // Update Obstacles Movement & Collision Checks
                for (let i = this.obstacles.length - 1; i >= 0; i--) {
                    const obs = this.obstacles[i];
                    obs.mesh.position.z += this.speed * 10;
                    obs.mesh.rotation.y += 0.02;

                    // Hit Box Radius Check
                    const dist = this.playerGroup.position.distanceTo(obs.mesh.position);
                    if (dist < obs.radius + 0.5) {
                        this.hp -= 35;
                        audio.playHit();
                        this.createExplosionParticles(obs.mesh.position, 0xff0055);
                        this.scene.remove(obs.mesh);
                        this.obstacles.splice(i, 1);

                        if (this.hp <= 0) {
                            this.hp = 0;
                            this.gameOver();
                        }
                        this.updateHUD();
                        continue;
                    }

                    // Remove out-of-bounds obstacles
                    if (obs.mesh.position.z > 10) {
                        this.scene.remove(obs.mesh);
                        this.obstacles.splice(i, 1);
                    }
                }

                // Update Collectibles Movement & Collision
                for (let i = this.collectibles.length - 1; i >= 0; i--) {
                    const col = this.collectibles[i];
                    col.mesh.position.z += this.speed * 10;
                    col.mesh.rotation.y += col.rotSpeed;

                    // Collection Check
                    const dist = this.playerGroup.position.distanceTo(col.mesh.position);
                    if (dist < col.radius + 0.5) {
                        this.orbsCount++;
                        this.score += 150;
                        this.hp = Math.min(100, this.hp + 10); // Restore Shield
                        audio.playPickup();
                        this.createExplosionParticles(col.mesh.position, 0xffcc00);
                        this.scene.remove(col.mesh);
                        this.collectibles.splice(i, 1);
                        this.updateHUD();
                        continue;
                    }

                    // Remove out-of-bounds collectibles
                    if (col.mesh.position.z > 10) {
                        this.scene.remove(col.mesh);
                        this.collectibles.splice(i, 1);
                    }
                }

                // Update Particles Lifecycle
                for (let i = this.particles.length - 1; i >= 0; i--) {
                    const p = this.particles[i];
                    p.mesh.position.add(p.velocity);
                    p.life -= p.decay;
                    p.mesh.scale.multiplyScalar(0.95);

                    if (p.life <= 0) {
                        this.scene.remove(p.mesh);
                        this.particles.splice(i, 1);
                    }
                }

                // Spawn new obstacles / collectibles
                this.spawnObjects();

                // HUD updates
                this.updateHUD();
            }

            updateHUD() {
                this.scoreText.innerText = Math.floor(this.score);
                this.multiplierText.innerText = `VEL: ${(this.speed * 100).toFixed(0)} KM/H`;
                this.orbsText.innerText = this.orbsCount;
                this.hpText.innerText = `${Math.ceil(this.hp)}%`;
                this.hpBar.style.width = `${Math.max(0, this.hp)}%`;
            }

            onWindowResize() {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }

            animate() {
                requestAnimationFrame(this.animate);
                this.update();
                this.renderer.render(this.scene, this.camera);
            }
        }

        // Initialize Game Engine on Page Load
        window.onload = () => {
            new Game();
        };
    </script>
</body>
</html>