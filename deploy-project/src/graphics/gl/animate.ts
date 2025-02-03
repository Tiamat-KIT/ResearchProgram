// 型定義
interface Star {
    x: number;
    y: number;
    rotation: number;
    velocityX: number;
    velocityY: number;
    rotationSpeed: number;
    size: number;
}

interface WebGLContext {
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    attributes: {
        position: number;
    };
    uniforms: {
        translation: WebGLUniformLocation;
        rotation: WebGLUniformLocation;
        scale: WebGLUniformLocation;
    };
}

class FrameStats {
    minTime: number;
    maxTime: number;
    totalTime: number;
    frameCount: number;
    frameTimes: number[];
    frameUpdateCounter: number;

    constructor() {
        this.minTime = Number.MAX_VALUE;
        this.maxTime = 0.0;
        this.totalTime = 0.0;
        this.frameCount = 0;
        this.frameTimes = [];
        this.frameUpdateCounter = 0;
    }

    update(frameTime: number): void {
        if (frameTime > 0 && frameTime < this.minTime) {
            this.minTime = frameTime;
        }
        if (frameTime > this.maxTime) {
            this.maxTime = frameTime;
        }
        this.totalTime += frameTime;
        this.frameCount += 1;
        this.frameTimes.push(frameTime);
        this.frameUpdateCounter = (this.frameUpdateCounter + 1) % 60;
    }

    shouldUpdateDisplay(): boolean {
        return this.frameUpdateCounter === 0;
    }

    averageTime(): number {
        return this.frameCount === 0 ? 0.0 : this.totalTime / this.frameCount;
    }

    displayStats(): void {
        const statsElement = document.getElementById("stats-ts");
        const formatNumber = (num: number): string => num.toFixed(6);
        if (statsElement) {
            statsElement.innerHTML = `
                <table>
                    <tr><th>Metric</th><th>Value</th></tr>
                    <tr><td>Min Time</td><td>${formatNumber(this.minTime)} sec</td></tr>
                    <tr><td>Max Time</td><td>${formatNumber(this.maxTime)} sec</td></tr>
                    <tr><td>Average Time</td><td>${formatNumber(this.averageTime())} sec</td></tr>
                    <tr><td>Total Frames</td><td>${this.frameCount}</td></tr>
                </table>
            `;
        }
    }

    downloadCSV(): void {
        const csvContent = [
            ...this.frameTimes.map((time) => `${time.toFixed(6)}`)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'frame_times.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}

function initWebGL(canvas: HTMLCanvasElement): WebGLContext | null {
    // 先にWebGL2が使えるかどうかをチェック
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;

    if(canvas.getContext('webgl2') !== null) {
        gl = canvas.getContext('webgl2');
        console.log('WebGL2 is available');
    } else {
        gl = canvas.getContext('webgl');
        console.log('WebGL is available');
    }

    const vsSource = `
        attribute vec2 position;
        uniform vec2 translation;
        uniform float rotation;
        uniform vec2 scale;
        void main() {
            float c = cos(rotation);
            float s = sin(rotation);
            mat2 rotationMatrix = mat2(c, -s, s, c);
            vec2 rotatedPos = rotationMatrix * position;
            vec2 scaledPos = rotatedPos * scale;
            vec2 finalPos = scaledPos + translation;
            gl_Position = vec4(finalPos, 0.0, 1.0);
        }
    `;

    const fsSource = `
        precision mediump float;
        void main() {
            gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
        }
    `;

    if(!gl) {
        console.error('WebGL not available');
        return null;
    }

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vsSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fsSource);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    return {
        gl,
        program,
        attributes: {
            position: gl.getAttribLocation(program, 'position')
        },
        uniforms: {
            translation: gl.getUniformLocation(program, 'translation')!,
            rotation: gl.getUniformLocation(program, 'rotation')!,
            scale: gl.getUniformLocation(program, 'scale')!
        }
    };
}

function createPentagramVertices(): Float32Array {
    const vertices: number[] = [];
    const points: [number, number][] = [];
    const radius = 1.0;
    
    const centerX = 0;
    const centerY = 0;
    
    for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
        points.push([
            radius * Math.cos(angle),
            radius * Math.sin(angle)
        ]);
    }

    const innerRadius = radius * 0.381966;
    const innerPoints: [number, number][] = [];
    for (let i = 0; i < 5; i++) {
        const angle = ((i * 2 * Math.PI / 5) + (Math.PI / 5)) - Math.PI / 2;
        innerPoints.push([
            innerRadius * Math.cos(angle),
            innerRadius * Math.sin(angle)
        ]);
    }

    for (let i = 0; i < 5; i++) {
        vertices.push(
            points[i][0], points[i][1],
            centerX, centerY,
            innerPoints[i][0], innerPoints[i][1],

            innerPoints[i][0], innerPoints[i][1],
            centerX, centerY,
            points[(i + 1) % 5][0], points[(i + 1) % 5][1]
        );
    }

    return new Float32Array(vertices);
}

function createStars(count: number): Star[] {
    return Array(count).fill(null).map(() => ({
        x: (Math.random() * 2 - 1),
        y: (Math.random() * 2 - 1),
        rotation: Math.random() * Math.PI * 2,
        velocityX: (Math.random() - 0.5) * 0.01,
        velocityY: (Math.random() - 0.5) * 0.01,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        size: 0.02 + Math.random() * 0.04
    }));
}

function createStarBuffer(gl: WebGLRenderingContext, stars: Star[]): WebGLBuffer {
    const starData = new Float32Array(stars.length * 7);
    stars.forEach((star, i) => {
        starData.set([star.x, star.y, star.rotation, star.velocityX, star.velocityY, star.rotationSpeed, star.size], i * 7);
    });

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, starData, gl.DYNAMIC_DRAW);
    return buffer;
}

function updateStarBuffer(gl: WebGLRenderingContext, buffer: WebGLBuffer, stars: Star[]): void {
    const starData = new Float32Array(stars.length * 7);
    stars.forEach((star, i) => {
        starData.set([star.x, star.y, star.rotation, star.velocityX, star.velocityY, star.rotationSpeed, star.size], i * 7);
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, starData);
}

export default function initializeRenderer(canvas: HTMLCanvasElement): void {
    const context = initWebGL(canvas);
    if (!context) {
        console.error('WebGL not available');
        return;
    }

    const { gl, attributes, uniforms } = context;
    const stats = new FrameStats();
    let lastTime = 0;

    // Initialize vertex buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, createPentagramVertices(), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attributes.position);
    gl.vertexAttribPointer(attributes.position, 2, gl.FLOAT, false, 0, 0);

    // Create stars
    const stars = createStars(1000);
    const starBuffer = createStarBuffer(gl, stars);

    // Set clear color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Setup download button
    document.getElementById('download-btn')?.addEventListener('click', () => {
        stats.downloadCSV();
    });

    // Animation function
    function render(currentTime: number): void {
        const frameTime = (currentTime - lastTime) / 1000;
        if (lastTime !== 0) {
            stats.update(frameTime);
        }
        lastTime = currentTime;

        gl.clear(gl.COLOR_BUFFER_BIT);

        stars.forEach(star => {
            star.x += star.velocityX;
            star.y += star.velocityY;
            star.rotation += star.rotationSpeed;

            if (Math.abs(star.x) > 1) star.velocityX *= -1;
            if (Math.abs(star.y) > 1) star.velocityY *= -1;
        });

        updateStarBuffer(gl, starBuffer, stars);

        stars.forEach(star => {
            gl.uniform2f(uniforms.translation, star.x, star.y);
            gl.uniform1f(uniforms.rotation, star.rotation);
            gl.uniform2f(uniforms.scale, star.size, star.size);
            gl.drawArrays(gl.TRIANGLES, 0, 30);
        });

        if (stats.shouldUpdateDisplay()) {
            stats.displayStats();
        }

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}