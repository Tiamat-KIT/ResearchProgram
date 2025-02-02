import { useEffect } from 'react';
import initializeRenderer from '../graphics/gl/animate';

export default function Gl_View() {
    useEffect(() => {
        const canvas = document.getElementById('glCanvas');
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error('Canvas要素の取得に失敗しました');
        }

        initializeRenderer(canvas);
    }, []);

    

    return (
        <main>
            <section>
                <div id="stats-ts" />
                <canvas id="glCanvas" />
                <button id="download-btn">Save</button>
            </section>
        </main>
    );
}

