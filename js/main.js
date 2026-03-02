let backgroundAudio = null;
let hasStartedAudio = false;
const POINTER_SPRITE_PATH = 'images/pointer.webp';
const POINTER_TOTAL_FRAMES = 11;
const POINTER_COLUMNS = 5;
const POINTER_ROWS = 3;
const POINTER_FRAME_DURATION = 45;
const buttonPointerStates = new WeakMap();
const pointerSpriteMetrics = {
        frameWidth: 64,
        frameHeight: 64
};

const buttons = document.getElementsByClassName('text-button');

document.addEventListener('DOMContentLoaded', () => {
    setup_pointer_sprite_metrics();
    page_just_loaded();
    buttons_hover_setup();
});


function buttons_hover_setup() {
  const supportsPointerEvents = 'PointerEvent' in window;

  for (const button of buttons) {
    if (supportsPointerEvents) {
        button.addEventListener('pointerenter', function() {
            show_button_pointers(this);
            play_ui_hover_audio();
        });

        button.addEventListener('pointerleave', function() {
            remove_button_pointers(this);
        });
    } else {
        button.addEventListener('mouseenter', function() {
            show_button_pointers(this);
            play_ui_hover_audio();
        });

        button.addEventListener('mouseleave', function() {
            remove_button_pointers(this);
        });
    }
  }
}


function play_ui_hover_audio() {
        const audio = new Audio('audio/ui change selection.wav');
        const playPromise = audio.play();

        if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {});
        }
}


function setup_pointer_sprite_metrics() {
        const pointerImage = new Image();
        pointerImage.onload = () => {
                pointerSpriteMetrics.frameWidth = Math.floor(pointerImage.naturalWidth / POINTER_COLUMNS);
                pointerSpriteMetrics.frameHeight = Math.floor(pointerImage.naturalHeight / POINTER_ROWS);
        };
        pointerImage.src = POINTER_SPRITE_PATH;
}


function show_button_pointers(button) {
        remove_button_pointers(button);

        const leftPointer = create_pointer_sprite('left');
        const rightPointer = create_pointer_sprite('right');

        button.appendChild(leftPointer);
        button.appendChild(rightPointer);

        let frameIndex = 0;
        set_pointer_frame(leftPointer, frameIndex);
        set_pointer_frame(rightPointer, frameIndex);

        const animationIntervalId = window.setInterval(() => {
                frameIndex += 1;

                if (frameIndex >= POINTER_TOTAL_FRAMES) {
                        window.clearInterval(animationIntervalId);
                        return;
                }

                set_pointer_frame(leftPointer, frameIndex);
                set_pointer_frame(rightPointer, frameIndex);
        }, POINTER_FRAME_DURATION);

        buttonPointerStates.set(button, {
                leftPointer,
                rightPointer,
                animationIntervalId
        });
}


function remove_button_pointers(button) {
        const pointerState = buttonPointerStates.get(button);

        if (!pointerState) {
                return;
        }

        window.clearInterval(pointerState.animationIntervalId);
        pointerState.leftPointer.remove();
        pointerState.rightPointer.remove();
        buttonPointerStates.delete(button);
}


function create_pointer_sprite(side) {
        const pointer = document.createElement('span');
        pointer.className = `button-pointer ${side}`;
        pointer.style.width = `${pointerSpriteMetrics.frameWidth}px`;
        pointer.style.height = `${pointerSpriteMetrics.frameHeight}px`;
        pointer.style.backgroundImage = `url(${POINTER_SPRITE_PATH})`;
        pointer.style.backgroundSize = 'cover';

        return pointer;
}


function set_pointer_frame(pointerElement, frameIndex) {
        const column = frameIndex % POINTER_COLUMNS;
        const row = Math.floor(frameIndex / POINTER_COLUMNS);
        const x = -(column * pointerSpriteMetrics.frameWidth);
        const y = -(row * pointerSpriteMetrics.frameHeight);

        pointerElement.style.backgroundPosition = `${x}px ${y}px`;
        pointerElement.style.backgroundSize = `${pointerSpriteMetrics.frameWidth * POINTER_COLUMNS}px ${pointerSpriteMetrics.frameHeight * POINTER_ROWS}px`;
}


async function go_to_link(location) {
    const overlay = document.getElementById('overlay');

    if (overlay) {
        overlay.style.zIndex = 99999;
        overlay.style.opacity = 1;
    }

    const audio = new Audio('audio/ui button confirm.wav');
    audio.play();
    
    await delay(1000);

    window.location.href = location+".html";
}


async function page_just_loaded() {
    const overlay = document.getElementById('overlay');

    if (overlay) {
        overlay.style.zIndex = -10;
        overlay.style.opacity = 0;
        overlay.style.transition = "all 0.35s ease";
    }

    const hasAutoplayStarted = await background_music_play();

    if (!hasAutoplayStarted) {
        setup_audio_start_on_interaction();
    }


    await delay(1000);
}


function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


function background_music_play() {
    if (hasStartedAudio) {
        return Promise.resolve(true);
    }

    if (!backgroundAudio) {
        backgroundAudio = new Audio('audio/Title.wav');
        backgroundAudio.loop = true;
    }

    const playPromise = backgroundAudio.play();

    if (playPromise) {
        return playPromise
            .then(() => {
                hasStartedAudio = true;
                return true;
            })
            .catch(() => {
                hasStartedAudio = false;
                return false;
            });
    }

    hasStartedAudio = !backgroundAudio.paused;
    return Promise.resolve(hasStartedAudio);
}


function setup_audio_start_on_interaction() {
    const startAudio = () => {
        background_music_play();
        document.removeEventListener('click', startAudio);
        document.removeEventListener('keydown', startAudio);
        document.removeEventListener('touchstart', startAudio);
        document.removeEventListener('pointerdown', startAudio);
        document.removeEventListener('mousedown', startAudio);
    };

    document.addEventListener('click', startAudio, { once: true });
    document.addEventListener('keydown', startAudio, { once: true });
    document.addEventListener('touchstart', startAudio, { once: true });
    document.addEventListener('pointerdown', startAudio, { once: true });
    document.addEventListener('mousedown', startAudio, { once: true });
}
