import { Game } from './game.js';

let _cachedNaturalH = 0;
const CANVAS_NATURAL_H = 1120; // canvas-wrapper fixed height

function fitGameToViewport() {
    const container = document.getElementById('game-container');
    if (!container) return;

    // Use visualViewport API when available (better on iOS Safari with collapsing address bar)
    const vp = window.visualViewport;
    const vw = vp ? vp.width : window.innerWidth;
    const vh = vp ? vp.height : window.innerHeight;
    const naturalW = 1680;

    // Measure natural height once (with bars in flow) to avoid layout thrashing
    if (!_cachedNaturalH) {
        container.classList.remove('compact');
        container.style.transform = 'none';
        container.style.marginBottom = '0';
        _cachedNaturalH = container.offsetHeight;
    }

    // First pass: scale with bars in normal flow
    let scale = Math.min(vw / naturalW, vh / _cachedNaturalH, 1);
    let effectiveH = _cachedNaturalH;

    // If heavily scaled, switch to compact mode: overlay bars on canvas
    // This removes ~150px of bar height from the flow, giving ~13% more scale
    if (scale < 0.65) {
        container.classList.add('compact');
        effectiveH = CANVAS_NATURAL_H;
        scale = Math.min(vw / naturalW, vh / effectiveH, 1);
    } else {
        container.classList.remove('compact');
    }

    container.style.transform = `scale(${scale})`;
    container.style.transformOrigin = 'top center';
    // Compensate for transform not affecting layout flow
    const shrunkBy = effectiveH * (1 - scale);
    container.style.marginBottom = `-${shrunkBy}px`;

    // When scaling down, pin game to top and remove body padding for maximum space
    if (scale < 0.95) {
        document.body.style.padding = '0';
        document.body.style.justifyContent = 'flex-start';
    } else {
        document.body.style.padding = '';
        document.body.style.justifyContent = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvases = {
        terrain: document.getElementById('terrain-canvas'),
        game: document.getElementById('game-canvas'),
        ui: document.getElementById('ui-canvas'),
        fx: document.getElementById('fx-canvas'),
        three: document.getElementById('three-canvas'),
    };

    const game = new Game(canvases);
    game.run();

    // Expose for debugging
    window.game = game;

    // Responsive scaling
    fitGameToViewport();
    window.addEventListener('resize', fitGameToViewport);
    // visualViewport fires when iOS Safari toolbar collapses/expands
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', fitGameToViewport);
    }
    window.addEventListener('orientationchange', () => {
        // Recache natural height and refit after orientation settles
        _cachedNaturalH = 0;
        setTimeout(fitGameToViewport, 150);
    });
});
