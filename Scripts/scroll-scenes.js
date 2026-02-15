/* ---------------------------------------------------------
   RankMind - Scroll Scenes
   Purpose: scroll-driven, pinned section experiences.
   Current scenes:
     - Our Process (pinned for 1.5 screens, scrubbed reveals)
   --------------------------------------------------------- */

(function () {
    "use strict";

    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const smoothstep = (t) => t * t * (3 - 2 * t);

    function prefersReducedMotion() {
        return (
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        );
    }

    function setupOurProcessScene() {
        const section = document.querySelector(".our-process");
        if (!section) return;

        const header = document.getElementById("main-header");
        const inner = section.querySelector(".our-process-inner");
        const stepsWrap = section.querySelector(".process-steps");
        const steps = Array.from(section.querySelectorAll(".process-step"));
        if (!inner || !stepsWrap || steps.length === 0) return;

        // Respect reduced motion: keep your existing layout.
        if (prefersReducedMotion()) return;

        // Scene state
        let ticking = false;
        let lastProgress = -1;
        let maxProgressSeen = 0;
        let hasCompleted = false;
        let finalized = false;

        // Enable scene mode
        section.classList.add("rm-scene");

        // Cache child refs for faster updates
        const stepRefs = steps.map((el) => {
            const circle = el.querySelector(".step-circle");
            const content = el.querySelector(".step-content");
            return { el, circle, content };
        });

        // Scene config
        const n = steps.length;

        // Reveal timeline tuning (already tuned)
        const revealStart = 0.10; // reveal begins sooner
        const revealEnd = 0.84; // leave room so last step can finish
        const revealSpan = revealEnd - revealStart;
        const windowSize = 0.14; // each step reaches 1 sooner

        function setHeaderOffsetVar() {
            const h = header ? header.getBoundingClientRect().height : 0;
            document.documentElement.style.setProperty(
                "--rm-header-offset",
                `${Math.round(h)}px`
            );
        }

        function computeProgress() {
            const rect = section.getBoundingClientRect();
            const viewportH = window.innerHeight || 1;

            // If we're not near the viewport, skip heavy work (buffer helps as you approach)
            if (rect.bottom < -0.25 * viewportH || rect.top > 1.25 * viewportH)
                return null;

            const scrollY = window.scrollY || window.pageYOffset || 0;

            // Start earlier (headline closer to mid-screen)
            const startOffset = viewportH * 0.35;
            const startY = section.offsetTop - startOffset;

            const endY = startY + section.offsetHeight - viewportH;
            const span = Math.max(1, endY - startY);

            return clamp01((scrollY - startY) / span);
        }

        function apply(progress) {
            // 1) "Shape" intro: 0..1 over the first 7% of the scene (shorter intro)
            const shape = clamp01(progress / 0.07);
            section.style.setProperty("--rm-shape", String(shape));

            // 2) Line progress: after a small lead-in so it doesn't start instantly
            const line = clamp01((progress - 0.10) / 0.90);
            stepsWrap.style.setProperty("--rm-line", String(line));

            // 2.5) Shift the list up as progress increases so step 5 is visible during the pin
            // Starts shifting after ~35%, reaches max near the end.
            const shiftT = clamp01((progress - 0.35) / 0.65);
            const stepsShift = -Math.round(70 * smoothstep(shiftT)); // adjust 70 -> 90 if needed
            stepsWrap.style.setProperty("--rm-steps-shift", `${stepsShift}px`);

            // 3) Step reveals: evenly distributed across reveal span
            for (let i = 0; i < n; i++) {
                const t = revealStart + (i / Math.max(1, n - 1)) * revealSpan;
                const local = clamp01((progress - t) / windowSize);
                const eased = smoothstep(local);

                const { el, circle, content } = stepRefs[i];

                // Overall block
                el.style.opacity = String(eased);
                el.style.transform = `translateY(${(1 - eased) * 16}px)`;

                // Circle gets a subtle "inflate"
                if (circle) {
                    const s = 0.92 + 0.08 * eased;
                    circle.style.transform = `scale(${s})`;
                    circle.style.opacity = String(0.35 + 0.65 * eased);
                }

                // Content slides in a touch later (depth feel)
                if (content) {
                    const offset = (1 - eased) * 10;
                    content.style.transform = `translateY(${offset}px)`;
                    content.style.opacity = String(0.25 + 0.75 * eased);
                }
            }
        }

        function getNextSectionEl() {
            let el = section.nextElementSibling;
            while (el && el.tagName !== "SECTION") el = el.nextElementSibling;
            return el;
        }

        function freezeSceneAndReleaseOnNextSection() {
            // Freeze visuals fully open
            apply(1);

            // Stop scene scrubbing (prevents reopening / reversing)
            window.removeEventListener("scroll", requestUpdate, { passive: true });

            // Optional: keep resize in case header height changes while user is still here
            // (If you want it fully “dead”, also remove resize here.)
            // window.removeEventListener("resize", onResize);

            // Watch for reaching the next section, then release/collapse smoothly
            const nextSection = getNextSectionEl();
            if (!nextSection) {
                // If there is no next section, just collapse right away (edge case)
                releaseSceneAnchored(section);
                return;
            }

            const releaseObserver = new IntersectionObserver(
                (entries, obs) => {
                    for (const entry of entries) {
                        if (!entry.isIntersecting) continue;
                        obs.disconnect();
                        releaseSceneAnchored(nextSection);
                        return;
                    }
                },
                { threshold: 0.15 }
            );

            releaseObserver.observe(nextSection);
        }

        function releaseSceneAnchored(anchorEl) {
            if (finalized) return;
            finalized = true;

            // Anchor BEFORE layout collapse
            const scrollYBefore = window.scrollY || window.pageYOffset || 0;
            const anchorTopBefore = anchorEl.getBoundingClientRect().top;

            // Collapse scene to normal section
            section.classList.remove("rm-scene");
            section.classList.add("rm-scene-done");

            // Next frame: measure anchor shift and compensate so the anchor stays put
            requestAnimationFrame(() => {
                const anchorTopAfter = anchorEl.getBoundingClientRect().top;
                const delta = anchorTopAfter - anchorTopBefore;

                if (Math.abs(delta) > 0.5) {
                    window.scrollTo(0, scrollYBefore + delta);
                }

                // Cleanup inline vars/styles (same as you already do)
                section.style.removeProperty("--rm-shape");
                stepsWrap.style.removeProperty("--rm-line");
                stepsWrap.style.removeProperty("--rm-steps-shift");

                stepRefs.forEach(({ el, circle, content }) => {
                    el.style.removeProperty("opacity");
                    el.style.removeProperty("transform");
                    if (circle) {
                        circle.style.removeProperty("opacity");
                        circle.style.removeProperty("transform");
                    }
                    if (content) {
                        content.style.removeProperty("opacity");
                        content.style.removeProperty("transform");
                    }
                });

                // Fully remove listeners now
                window.removeEventListener("resize", onResize);
            });
        }

        function update() {
            ticking = false;

            const p = computeProgress();
            if (p === null) return;

            // Latch progress: never go backwards
            maxProgressSeen = Math.max(maxProgressSeen, p);

            // Complete -> finalize and disable scene permanently (for this page load)
            if (!hasCompleted && maxProgressSeen >= 0.98) {
                hasCompleted = true;
                freezeSceneAndReleaseOnNextSection();
                return;
            }

            // Reduce redundant repaints (based on raw p, not latched value)
            if (Math.abs(p - lastProgress) < 0.001) return;
            lastProgress = p;

            apply(maxProgressSeen);
        }

        function requestUpdate() {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(update);
        }

        function onResize() {
            setHeaderOffsetVar();
            requestUpdate();
        }

        setHeaderOffsetVar();
        requestUpdate();

        window.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("resize", onResize);
    }

    document.addEventListener("DOMContentLoaded", () => {
        setupOurProcessScene();
    });
})();
