import React, { useRef, Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame, extend } from '@react-three/fiber';
import { useTexture, shaderMaterial } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

// ========================================================
// SHADER: "WAVES GLOW" (GIỮ NGUYÊN)
// ========================================================
const PortalMaterial = shaderMaterial(
    { uProgress: 0, uLoadProgress: 0, uAspect: 1.0, uTime: 0, tex1: null, tex2: null },
    `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    `
    uniform float uProgress;
    uniform float uLoadProgress;
    uniform float uAspect;
    uniform float uTime;
    uniform sampler2D tex1;
    uniform sampler2D tex2;
    varying vec2 vUv;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    float fbm(vec2 p) {
        float f = 0.0;
        f += 0.5000 * noise(p); p = p * 2.02;
        f += 0.2500 * noise(p); p = p * 2.03;
        f += 0.1250 * noise(p);
        return f;
    }

    void main() {
        vec2 centeredUv = vUv - 0.5;
        centeredUv.y *= 1.2;
        
        vec2 geoUv = vUv - 0.5;
        geoUv.x *= uAspect;
        centeredUv.x *= uAspect;
        float dist = length(centeredUv);
        
        float lw = 0.0015;
        float lp = uLoadProgress * 1.5;
        
        float axisX = smoothstep(lw, 0.0, abs(geoUv.y)) * step(abs(geoUv.x), lp);
        float axisY = smoothstep(lw, 0.0, abs(geoUv.x)) * step(abs(geoUv.y), lp);
        float diag1 = smoothstep(lw, 0.0, abs(geoUv.x - geoUv.y)) * step(abs(geoUv.x), lp);
        float diag2 = smoothstep(lw, 0.0, abs(geoUv.x + geoUv.y)) * step(abs(geoUv.x), lp);
        
        float angle = (atan(geoUv.y, geoUv.x) + 3.14159265) / 6.2831853;
        float circTrace = step(angle, lp);
        
        float r = length(geoUv);
        float circs = (smoothstep(lw, 0.0, abs(r - 0.25)) + smoothstep(lw, 0.0, abs(r - 0.5)) + smoothstep(lw, 0.0, abs(r - 0.75))) * circTrace;
        
        float arcs = (smoothstep(lw, 0.0, abs(length(geoUv - vec2(0.25, 0.25)) - 0.5)) +
                      smoothstep(lw, 0.0, abs(length(geoUv - vec2(-0.25, -0.25)) - 0.5)) +
                      smoothstep(lw, 0.0, abs(length(geoUv - vec2(0.25, -0.25)) - 0.5)) +
                      smoothstep(lw, 0.0, abs(length(geoUv - vec2(-0.25, 0.25)) - 0.5))) * circTrace;

        float draftingLines = clamp(axisX + axisY + diag1 + diag2 + circs + arcs, 0.0, 1.0);
        float lineFade = 1.0 - smoothstep(0.2, 0.8, r);
        vec3 geoLinesColor = vec3(draftingLines * lineFade * 0.09);

        float imgFade = smoothstep(0.3, 1.0, uLoadProgress);

        float macroNoise = fbm(vUv * 20.0);  
        float microNoise = fbm(vUv * 320.0);
        float edge = dist + (macroNoise * 0.35) + (microNoise * 0.08);
        float progress = (uProgress * 2.0) - 0.3;
        float isRevealed = smoothstep(progress, progress + 0.005, edge);

        vec4 color1 = texture2D(tex1, vUv) * imgFade;
        vec4 color2 = texture2D(tex2, vUv) * imgFade;
        
        color1.rgb += geoLinesColor;
        vec4 finalColor = mix(color2, color1, isRevealed);

        float distToEdge = abs(edge - progress);
        float waveNoise = sin(angle * 12.0 + uTime * 4.0) * 0.5 + 0.5;
        
        float waveLine = 1.0 - smoothstep(0.0, 0.004, distToEdge);
        waveLine *= mix(0.4, 1.0, waveNoise); 

        float waveGlow = 1.0 - smoothstep(0.0, 0.015, distToEdge);
        waveGlow *= mix(0.2, 1.0, waveNoise); 

        float inProgress = step(0.01, uProgress) * step(uProgress, 0.99);
        
        if (inProgress > 0.0) {
            vec3 glowColor = vec3(1.2, 1.5, 2.5); 
            vec3 coreColor = vec3(2.0, 2.2, 2.5); 
            vec3 magicWave = (glowColor * waveGlow * 1.5) + (coreColor * waveLine * 2.0);
            finalColor.rgb += magicWave;
        }
        
        gl_FragColor = finalColor;
    }
    `
);
extend({ PortalMaterial });

// ========================================================
// COMPONENT DỰNG HÌNH 3D
// ========================================================
const Scene = ({ progressRef, loadProgressRef }) => {
    const meshRef = useRef();
    const materialRef = useRef();
    const { viewport, size } = useThree();
    const aspect = size.width / size.height;

    const tex1 = useTexture("/anh_cua_shoptify(2).png");
    const tex2 = useTexture("/anh_thu_hai_cua_shoptify(2).png");

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uProgress.value = progressRef.current;
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
            materialRef.current.uniforms.uLoadProgress.value = loadProgressRef.current;
        }

        if (meshRef.current) {
            const targetX = -(state.pointer.x * 0.15);
            const targetY = -(state.pointer.y * 0.15);
            meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.05;
            meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.05;
        }
    });

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[viewport.width * 1.15, viewport.height * 1.15]} />
            <portalMaterial ref={materialRef} tex1={tex1} tex2={tex2} uAspect={aspect} />
        </mesh>
    );
};

// ========================================================
// LANDING PAGE CHÍNH THỨC
// ========================================================
export default function LandingPage() {
    const heroSectionRef = useRef(null);
    const progressRef = useRef(0);
    const loadProgressRef = useRef(0);

    // Refresh ScrollTrigger when component mounts
    useEffect(() => {
        ScrollTrigger.refresh();
    }, []);

    const lineTopRef = useRef(null);
    const lineRightRef = useRef(null);
    const lineBottomRef = useRef(null);
    const lineLeftRef = useRef(null);
    const frameContentRef = useRef(null);
    const logoRef = useRef(null);
    const loginRef = useRef(null);
    const registerRef = useRef(null);
    const textIntroRef = useRef(null);
    const page2TextRef = useRef(null);

    const horizontalContainerRef = useRef(null);
    const horizontalTrackRef = useRef(null);

    // --- ANIMATION CHO SECTION 1 (HERO 3D) ---
    useGSAP(() => {
        const tlLoad = gsap.timeline();

        tlLoad.to(loadProgressRef, { current: 1, duration: 3.5, ease: "power2.inOut" }, 0);

        tlLoad.to(lineTopRef.current, { width: '100%', duration: 1.0, ease: "power3.inOut" }, 0.5)
            .to(lineRightRef.current, { height: '100%', duration: 1.0, ease: "power3.inOut" }, 0.5)
            .to(lineBottomRef.current, { width: '100%', duration: 1.0, ease: "power3.inOut" }, 0.5)
            .to(lineLeftRef.current, { height: '100%', duration: 1.0, ease: "power3.inOut" }, 0.5);

        tlLoad.fromTo([logoRef.current, textIntroRef.current, loginRef.current, registerRef.current],
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "power2.out" },
            1.5);

        const tlScroll = gsap.timeline({
            scrollTrigger: {
                trigger: heroSectionRef.current,
                start: "top top",
                end: "+=150%",
                // Đổi từ true sang 1.5 để scroll mượt hơn, giảm cảm giác giật lag
                scrub: 1.5,
                pin: true,
                onUpdate: (self) => { progressRef.current = self.progress; }
            }
        });

        tlScroll.to(frameContentRef.current, { opacity: 0, duration: 0.15, ease: "power2.out" }, 0);

        const isMobile = window.innerWidth < 768;

        tlScroll.to(logoRef.current, {
            top: isMobile ? "20px" : "24px",
            left: isMobile ? "50%" : "40px",
            xPercent: isMobile ? -50 : 0,
            fontSize: "1.8rem",
            ease: "none"
        }, 0);

        tlScroll.to(loginRef.current, {
            top: "20px",
            left: isMobile ? "calc(50% - 110px)" : "calc(100vw - 260px)",
            padding: "8px 24px",
            backgroundColor: "#ffffff",
            color: "#000000",
            borderRadius: "30px",
            ease: "none"
        }, 0);

        tlScroll.to(registerRef.current, {
            top: "20px",
            left: isMobile ? "calc(50% + 10px)" : "calc(100vw - 130px)",
            padding: "8px 24px",
            border: "1px solid #ffffff",
            borderRadius: "30px",
            ease: "none"
        }, 0);

        tlScroll.fromTo(page2TextRef.current,
            { opacity: 0, clipPath: 'inset(0% 100% 0% 0%)', x: -30 },
            { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', x: 0, duration: 0.5, ease: "power2.out" },
            0.25
        );

    }, { scope: heroSectionRef });

    // --- ANIMATION CHO SECTION 2 (HORIZONTAL SCROLL) ---
    useGSAP(() => {
        const track = horizontalTrackRef.current;

        const scrollTween = gsap.to(track, {
            x: () => -(track.scrollWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: {
                trigger: horizontalContainerRef.current,
                start: "top top",
                end: () => `+=${track.scrollWidth - window.innerWidth}`,
                pin: true,
                // Đổi thành 1.2 để mượt hơn nữa
                scrub: true,
                invalidateOnRefresh: true,
            }
        });

        gsap.utils.toArray('.reveal-text').forEach(el => {
            gsap.from(el, {
                y: 100,
                skewY: 5,
                opacity: 0,
                duration: 1.2,
                ease: "power4.out",
                scrollTrigger: {
                    trigger: el,
                    containerAnimation: scrollTween,
                    start: "left 90%",
                }
            });
        });

        gsap.utils.toArray('.reveal-img').forEach(imgWrapper => {
            const img = imgWrapper.querySelector('img');
            gsap.from(img, {
                scale: 1.4,
                duration: 1.5,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: imgWrapper,
                    containerAnimation: scrollTween,
                    start: "left 95%",
                }
            });
        });

    }, { scope: horizontalContainerRef });

    return (
        <div className="m-0 p-0 w-full max-w-[100vw] overflow-x-hidden bg-black text-white">

            <style>
                {`
                body {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                    overflow-x: hidden;
                    max-width: 100vw;
                }
                body::-webkit-scrollbar {
                    display: none;
                }
                `}
            </style>

            {/* SECTION 1: HERO 3D PORTAL */}
            <div ref={heroSectionRef} className="relative w-screen max-w-[100vw] h-screen overflow-hidden">
                <Canvas gl={{ antialias: false, toneMapping: THREE.NoToneMapping }} className="absolute inset-0 w-full h-full z-[1]">
                    <Suspense fallback={null}>
                        <Scene progressRef={progressRef} loadProgressRef={loadProgressRef} />
                    </Suspense>
                </Canvas>

                <div className="absolute inset-0 z-10 pointer-events-none">
                    <div ref={frameContentRef}>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[420px] h-[350px] md:h-[480px] bg-white/5 pointer-events-none">
                            <div ref={lineTopRef} className="absolute top-0 left-0 h-[1px] bg-white" style={{ width: '0%' }} />
                            <div ref={lineRightRef} className="absolute top-0 right-0 w-[1px] bg-white" style={{ height: '0%' }} />
                            <div ref={lineBottomRef} className="absolute bottom-0 right-0 h-[1px] bg-white" style={{ width: '0%' }} />
                            <div ref={lineLeftRef} className="absolute bottom-0 left-0 w-[1px] bg-white" style={{ height: '0%' }} />
                        </div>
                        <div ref={textIntroRef} className="absolute top-[calc(50%-30px)] left-1/2 -translate-x-1/2 text-center md:text-left md:translate-x-0 md:left-[calc(50%-160px)] w-[280px] md:w-[320px] text-white/85 text-[0.95rem] md:text-[1.05rem] leading-[1.6] font-light pointer-events-none">
                            Khám phá một thế giới âm nhạc không giới hạn.<br />Hơn 10,000+ trải nghiệm độc quyền đang chờ đón bạn.
                        </div>
                    </div>

                    <div ref={logoRef} style={{ willChange: 'top, left, transform' }} className="absolute top-[10%] md:top-[calc(50%-190px)] left-1/2 -translate-x-1/2 md:translate-x-0 md:left-[calc(50%-160px)] text-[2.5rem] md:text-[3rem] font-extrabold tracking-widest pointer-events-auto leading-none">
                        BUZZIFY
                    </div>
                    <Link to="/login" ref={loginRef} style={{ willChange: 'top, left, padding, background-color' }} className="absolute top-[calc(50%+120px)] left-1/2 -translate-x-1/2 md:translate-x-0 md:left-[calc(50%-160px)] text-sm md:text-[0.95rem] font-semibold cursor-pointer pointer-events-auto px-0 py-0 border border-transparent rounded-none transition-all duration-200 flex items-center justify-center hover:opacity-70">
                        Đăng nhập
                    </Link>
                    <Link to="/register" ref={registerRef} style={{ willChange: 'top, left, padding' }} className="absolute top-[calc(50%+160px)] left-1/2 -translate-x-1/2 md:translate-x-0 md:left-[calc(50%-160px)] text-sm md:text-[0.95rem] font-semibold cursor-pointer pointer-events-auto px-0 py-0 border border-transparent rounded-none transition-all duration-200 flex items-center justify-center hover:opacity-70">
                        Đăng ký
                    </Link>

                    <div ref={page2TextRef} className="absolute bottom-[10%] md:bottom-[12%] left-[5%] md:left-[8%] w-[90%] md:w-[60%] max-w-[850px] text-white text-[1.5rem] md:text-[2.2rem] font-['Times_New_Roman',Times,Georgia,serif] leading-[1.4] pointer-events-none">
                        Buzzify - Nền tảng nghe nhạc trực tuyến mang đến trải nghiệm âm thanh tuyệt đỉnh. Khám phá hàng triệu bài hát, podcast và các nội dung độc quyền dành riêng cho bạn.
                    </div>
                </div>
            </div>

            {/* SECTION 2: HORIZONTAL SCROLL TẠP CHÍ */}
            <div
                ref={horizontalContainerRef}
                className="w-full max-w-[100vw] h-screen overflow-hidden bg-[#f4f2ed] text-[#1a1a1a] font-['Inter',sans-serif]"
            >
                <div
                    ref={horizontalTrackRef}
                    className="flex h-full w-max items-center px-[5vw] md:px-[10vw]"
                >
                    {/* PANEL 1: Tiêu đề */}
                    <div className="w-[100vw] md:w-[80vw] shrink-0 pr-[5vw] md:pr-[10vw] relative">
                        <div className="overflow-hidden inline-block align-top">
                            <h2 className="reveal-text text-[4rem] md:text-[6rem] lg:text-[7rem] font-['Times_New_Roman',Times,serif] font-bold leading-[1.1] m-0">
                                KHÁM PHÁ
                            </h2>
                        </div>
                        <br />
                        <div className="overflow-hidden inline-block align-top">
                            <h2 className="reveal-text text-[3.5rem] md:text-[5rem] lg:text-[6rem] font-['Times_New_Roman',Times,serif] italic text-[#555] m-0">
                                KHÔNG GIỚI HẠN
                            </h2>
                        </div>

                        <p className="reveal-text text-[1rem] md:text-[1.2rem] mt-[20px] md:mt-[40px] max-w-[300px] md:max-w-[400px] opacity-80 leading-[1.6]">
                            Buzzify mang thế giới âm nhạc đến ngay trong tầm tay bạn. Trải nghiệm nền tảng streaming đẳng cấp với chất lượng âm thanh nguyên bản.
                        </p>

                        <div className="reveal-img absolute -top-[5vh] right-[5vw] md:-top-[10vh] md:right-[10vw] w-[30vw] h-[30vw] md:w-[15vw] md:h-[15vw] overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="decor" />
                        </div>
                    </div>

                    {/* PANEL 2: 100M+ */}
                    <div className="w-[110vw] md:w-[90vw] shrink-0 flex flex-col md:flex-row items-center relative gap-4 md:gap-0">
                        <div className="w-[80vw] md:w-[25vw] z-10 pr-0 md:pr-[3vw] text-center md:text-left">
                            <div className="overflow-hidden inline-block align-top">
                                <h3 className="reveal-text text-[4.5rem] md:text-[5rem] font-['Times_New_Roman',serif] m-0">100M+</h3>
                            </div>
                            <p className="reveal-text text-[1rem] md:text-[1.2rem] opacity-80 leading-[1.6] mt-[10px] md:mt-[20px]">
                                Thư viện khổng lồ với hơn 100 triệu bài hát và podcast. Từ hit toàn cầu đến nghệ sĩ Indie.
                            </p>
                        </div>

                        <div className="reveal-img w-[80vw] h-[40vh] md:w-[50vw] md:h-[75vh] overflow-hidden z-[1]">
                            <img src="https://images.unsplash.com/photo-1614145121029-83a9f7b68bf4?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover" alt="music" />
                        </div>

                        <div className="reveal-img absolute bottom-[15vh] left-[5vw] md:bottom-[5vh] md:left-[18vw] w-[30vw] h-[20vh] md:w-[15vw] md:h-[25vh] overflow-hidden z-[3] border-[4px] border-[#f4f2ed]">
                            <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" alt="overlap" />
                        </div>
                    </div>

                    {/* PANEL 3: 3 Ảnh lệch nhau */}
                    <div className="w-[120vw] md:w-[110vw] shrink-0 flex flex-col md:flex-row items-center relative">
                        <div className="reveal-img absolute top-[5vh] md:top-[10vh] left-0 w-[35vw] md:w-[22vw] h-[25vh] md:h-[35vh] overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" alt="left" />
                        </div>

                        <div className="w-[60vw] md:w-[40vw] ml-[20vw] md:ml-[35vw] text-center z-[2]">
                            <div className="overflow-hidden inline-block align-top">
                                <h3 className="reveal-text text-[3rem] md:text-[4.5rem] font-['Times_New_Roman',serif] leading-[1.1] m-0">ĐỒNG HÀNH<br />CÙNG THẦN TƯỢNG</h3>
                            </div>
                            <p className="reveal-text text-[1rem] md:text-[1.2rem] opacity-80 mt-[15px] md:mt-[20px] leading-[1.6]">
                                Kết nối và nhận thông báo ngay lập tức khi nghệ sĩ ra mắt nhạc mới hoặc tổ chức sự kiện.
                            </p>
                        </div>

                        <div className="reveal-img absolute bottom-[10vh] md:bottom-[5vh] right-[10vw] md:right-0 w-[45vw] md:w-[30vw] h-[30vh] md:h-[45vh] overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" alt="right" />
                        </div>
                    </div>

                    {/* PANEL 4: Lyrics */}
                    <div className="w-[100vw] md:w-[90vw] shrink-0 flex items-center justify-start relative gap-[5vw]">
                        <div className="reveal-img w-[40vw] md:w-[25vw] h-[60vh] md:h-[80vh] overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" alt="lyrics phone" />
                        </div>

                        <div className="w-[45vw] md:w-[35vw] z-[2]">
                            <div className="overflow-hidden inline-block align-top">
                                <h3 className="reveal-text text-[3.5rem] md:text-[4.5rem] font-['Times_New_Roman',serif] m-0 mb-[10px] md:mb-[20px]">Smart Lyrics</h3>
                            </div>
                            <p className="reveal-text text-[1rem] md:text-[1.2rem] opacity-80 leading-[1.6]">
                                Hát theo điệu nhạc với tính năng lời bài hát chạy thời gian thực được đồng bộ hoàn hảo từng câu chữ.
                            </p>
                        </div>

                        <div className="reveal-img absolute top-[15vh] md:top-[20vh] right-[2vw] md:right-[5vw] w-[35vw] md:w-[25vw] h-[15vh] md:h-[20vh] overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" alt="concert lights" />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
